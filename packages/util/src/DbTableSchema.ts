import { z } from "zod";

export class DbTableSchema<TShape extends z.ZodObject<z.ZodRawShape>, T extends z.infer<TShape>> {

    readonly schema: TShape;
    readonly field: { [k in keyof T] : Readonly<string> };
    readonly tableName: string;

    constructor(tableName: string, schema: TShape) {
        this.tableName = tableName;
        this.schema = schema;

        const keyof = schema.keyof() as z.ZodEnum<[string, ...string[]]>;
        this.field = Object.fromEntries(keyof.options.map(x => [x, x])) as { [k in keyof T]: Readonly<string> };
    }
}