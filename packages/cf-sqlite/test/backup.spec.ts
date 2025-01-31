import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { runInDurableObject } from 'cloudflare:test';
import { DurableSqliteQuery } from '@/DurableSqliteQuery';
import { DurableObjectSqlExport } from '@/DurableObjectSqlExport';
import { DurableObject } from 'cloudflare:workers';
import { faker } from '@faker-js/faker';
import { ArrayUtil } from '@slime/util';
import { stringToReadableStreamChunks } from './chunkable-stream';

export class MockSqlBackupDo extends DurableObject {
	get state() {
		return this.ctx;
	}
	get storage() {
		return this.ctx.storage;
	}
}

type SampleTable = {
	rowId: number;
	bin: ArrayBuffer | null;
	text: string | null;
	number: number | null;
	float: number | null;
	not_null: string;
};

function randomBin(max: number) {
	const array = new Uint8Array(faker.number.int({ max }));
	crypto.getRandomValues(array);
	return array.buffer;
}

describe('Database backup', () => {
	it('should preserve database data', async () => {
		// Generate fake database
		const length = 10;
		const fakes = ArrayUtil.range(0, length - 1)
			.map(() => {
				return {
					name: `${faker.string.alpha({ length: { min: 1, max: 10 } })}_${faker.string.alpha({ length: { min: 1, max: 10 } })}`,
					fields: ArrayUtil.range(0, 99)
						.map((x) => {
							return {
								rowId: x + 1,
								bin: faker.datatype.boolean(0.85) ? randomBin(42) : null,
								text: faker.datatype.boolean(0.85) ? faker.string.sample({ min: 0, max: 60 }) : null,
								number: faker.datatype.boolean(0.85) ? faker.number.int() : null,
								float: faker.datatype.boolean(0.85) ? faker.number.float() : null,
								not_null: faker.string.sample({ min: 0, max: 60 }),
							} satisfies SampleTable;
						})
						.toArray(),
				};
			})
			.toArray();

		const backup = env.MockSqlBackupDO.newUniqueId();
		const dump = await runInDurableObject(env.MockSqlBackupDO.get(backup), async (instance: MockSqlBackupDo) => {
			const { writable, readable } = new TextEncoderStream();
			const sql = new DurableSqliteQuery(instance.storage);
			for (let fake of fakes) {
				const dbName = fake.name;
				sql.raw(
					`CREATE TABLE IF NOT EXISTS "${dbName}" (rowId INTEGER PRIMARY KEY AUTOINCREMENT, bin BLOB, text TEXT, number INTEGER, float REAL, not_null TEXT NOT NULL)`,
				);
				for (let field of fake.fields) {
					sql.raw(
						`INSERT INTO "${dbName}" ("bin", "text", "number", "float", "not_null") VALUES (?, ?, ?, ?, ?)`,
						field.bin,
						field.text,
						field.number,
						field.float,
						field.not_null,
					);
				}
			}

			new DurableObjectSqlExport(instance.storage).exportSql(writable);
			return await new Response(readable).text();
		});

		const restore = env.MockSqlBackupDO.newUniqueId();
		await runInDurableObject(env.MockSqlBackupDO.get(restore), async (instance: MockSqlBackupDo) => {
			const stream = stringToReadableStreamChunks(dump, () => faker.number.int({ min: 10, max: 256 }));
			await new DurableObjectSqlExport(instance.storage).importSql(stream);
			const sql = new DurableSqliteQuery(instance.storage);

			// check if all data matches
			expect(sql.tables.toArray()).toEqual(fakes.map((x) => x.name));
			for (let fake of fakes) {
				for (let i = 0; i < fake.fields.length; ++i) {
					const row = sql.raw(`SELECT * FROM "${fake.name}" WHERE rowId=${i + 1}`);
					expect(row.single()).toEqual(fake.fields[i]);
				}
			}
		});
	});
});
