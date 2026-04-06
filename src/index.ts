import { DatabaseSync, DatabaseSyncOptions } from "node:sqlite"
export { version } from "../package.json"

export class SqliteMap<K, V> {
    private db: DatabaseSync

    constructor(path: string, options?: DatabaseSyncOptions) {
        this.db = new DatabaseSync(path, options)
        this.db.exec("CREATE TABLE IF NOT EXISTS map (key TEXT PRIMARY KEY, value TEXT)")
    }
}
