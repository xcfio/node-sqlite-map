import { DatabaseSync, DatabaseSyncOptions } from "node:sqlite"
export { version } from "../package.json"

export class SqliteMap<K extends string, V> {
    private db: DatabaseSync

    constructor(path: string, options?: DatabaseSyncOptions) {
        this.db = new DatabaseSync(path, options)
        this.db.exec("CREATE TABLE IF NOT EXISTS map (key TEXT PRIMARY KEY, value TEXT)")
    }

    set(key: K, data: V): this {
        const stmt = this.db.prepare(`INSERT OR REPLACE INTO cache (key, value) VALUES (?, ?)`)
        stmt.run(String(key), JSON.stringify(data), Date.now())
        return this
    }
}
