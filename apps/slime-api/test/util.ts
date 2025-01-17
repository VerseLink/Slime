export function makeSqlOneLine(sql: string) {
    return sql.replace(/--.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\s+/g, ' ') // Replace newlines and extra spaces with a single space
        .trim();
}