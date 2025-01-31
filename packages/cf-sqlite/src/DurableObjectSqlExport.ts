import { DurableSqliteQuery } from './DurableSqliteQuery';
import { byteToHex } from './CachedByteToHex';

/**
 * Exports / Imports / Backup / Restore Sql database, will not restore any KV data!
 */
export class DurableObjectSqlExport {
	private storage: DurableObjectStorage;
	private sql: DurableSqliteQuery;

	constructor(storage: DurableObjectStorage) {
		this.storage = storage;
		this.sql = new DurableSqliteQuery(this.storage);
	}

	async exportSql(writable: WritableStream<string>) {
		const writer = writable.getWriter();

		await this.storage.transaction(async () => {
			const tables = this.sql.raw<{ name: string; sql: string }>(
				"SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' AND sql NOTNULL;",
			);
			// Get all tables
			for (let table of tables) {
				// write table (CREATE TABLE)
				await writer.write(`${table.sql};\n\n`);

				const associates = this.sql.raw<{ sql: string }>(
					`SELECT sql FROM sqlite_master WHERE type!='table' AND type!='meta' AND tbl_name='${table.name}'`,
				);
				let hasAssociates = false;
				for (let associate of associates) {
					hasAssociates = true;
					await writer.write(`${associate.sql};\n`);
				}
				if (hasAssociates) {
					await writer.write('\n');
				}

				const tableContent = this.sql.raw(`SELECT * FROM ${table.name}`);
				for (let row of tableContent) {
					await writer.write(`INSERT INTO ${table.name} VALUES (`);
					const values = Object.values(row);
					for (let i = 0; i < values.length; ++i) {
						const value = values[i];
						if (i !== 0) await writer.write(`, `);
						// SqlStorageValue can be ArrayBuffer | string | number | null
						if (value === null) {
							await writer.write('NULL');
							continue;
						}
						// 'string' escaped with 'stri''in''g' (= str'in'g)
						if (typeof value === 'string') {
							// TODO: chunk this for better memory performance
							await writer.write(`'${value.replace(/'/g, "''")}'`);
							continue;
						}
						if (typeof value === 'number') {
							await writer.write(value.toString());
							continue;
						}
						// ArrayBuffer
						// x'hex'
						const buff = new Uint8Array(value);
						await writer.write("x'");
						byteToHex.init();
						for (let i = 0; i < buff.length; ++i) {
							await writer.write(byteToHex.convert[buff[i] % byteToHex.length]);
						}
						await writer.write("'");
					}
					await writer.write(`);\n`);
				}

				await writer.write('\n');
			}
		});

		await writer.close();
	}

	async backup(filename: string, r2: R2Bucket) {
		const textstream = new TextEncoderStream();
		const dump = this.exportSql(textstream.writable);
		const part = await r2.createMultipartUpload(filename);
		await part.complete([await part.uploadPart(0, textstream.readable)]);
		await dump;
	}

	async importSql(readable: ReadableStream<string> | string) {
		await this.sql.transaction(async () => {
			this.sql.raw('PRAGMA defer_foreign_keys = on');
			for await (let line of DurableObjectSqlExport.parseSqlLines(readable)) {
				this.sql.raw(line);
			}
			this.sql.raw('PRAGMA defer_foreign_keys = off');
		});
	}

	static async *parseSqlLines(data: ReadableStream<string> | string) {
		// convert string to also be readable stream
		let readable =
			typeof data !== 'string'
				? data
				: new ReadableStream({
						start(controller) {
							controller.enqueue(readable);
							controller.close();
						},
					});

		let remainder = '';
		let currendStatement = '';
		for await (let part of readable) {
			const lines = part.split('\n');
			lines[0] = remainder + lines[0];
			remainder = lines[lines.length - 1];
			if (lines.length === 1) continue;
			// we don't want to trim the last line just yet
			// because we might receive more part of the line in the future
			for (let i = 0; i < lines.length - 1; ++i) {
				const trimmed = lines[i].trim();

				if (trimmed.startsWith('--') || trimmed === '') continue;
				// future: handle multi line comment?

				currendStatement += trimmed;

				if (currendStatement.endsWith(';')) {
					yield currendStatement;
					currendStatement = '';
				}
			}
		}
		remainder = remainder.trim();
		if (remainder.startsWith('--') || remainder === '') return;
		yield remainder;
	}
}
