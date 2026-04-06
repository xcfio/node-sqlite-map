import { DatabaseSync, DatabaseSyncOptions } from "node:sqlite"
export { version } from "../package.json"

export class SqliteMap<K extends string, V> {
    private db: DatabaseSync

    constructor(path: string, options?: DatabaseSyncOptions) {
        this.db = new DatabaseSync(path, { ...options })
        this.db.exec("CREATE TABLE IF NOT EXISTS map (key TEXT PRIMARY KEY, value TEXT)")
    }

    set(key: K, data: V): this {
        this.db
            .prepare(`INSERT OR REPLACE INTO map (key, value) VALUES (?, ?)`)
            .run(this.serializeKey(key), this.serialize(data))
        return this
    }

    get(key: K): V | undefined {
        const row = this.db.prepare(`SELECT value FROM map WHERE key = ?`).get(this.serializeKey(key))
        return typeof row?.value === "string" ? this.deserialize(row.value) : undefined
    }

    has(key: K): boolean {
        const row = this.db.prepare(`SELECT 1 FROM map WHERE key = ?`).get(this.serializeKey(key))
        return Boolean(row)
    }

    delete(key: K): boolean {
        const result = this.db.prepare(`DELETE FROM map WHERE key = ?`).run(this.serializeKey(key))
        return result.changes > 0
    }

    clear(): void {
        this.db.exec("DELETE FROM map")
    }

    getOrInsert(key: K, defaultValue: V): V {
        const existing = this.get(key)
        if (existing !== undefined) return existing
        this.set(key, defaultValue)
        return defaultValue
    }

    getOrInsertComputed(key: K, callbackFn: (key: K) => V): V {
        const existing = this.get(key)
        if (existing !== undefined) return existing
        const value = callbackFn(key)
        this.set(key, value)
        return value
    }

    keys(): IterableIterator<K> {
        const rows = this.db.prepare(`SELECT key FROM map`).all() as { key: string }[]
        return rows.map((row) => row.key as K)[Symbol.iterator]()
    }

    values(): IterableIterator<V> {
        const rows = this.db.prepare(`SELECT value FROM map`).all() as { value: string }[]
        return rows.map((row) => this.deserialize(row.value))[Symbol.iterator]()
    }

    entries(): IterableIterator<[K, V]> {
        const rows = this.db.prepare(`SELECT key, value FROM map`).all() as { key: string; value: string }[]
        return rows.map((row) => [row.key as K, this.deserialize(row.value)] as [K, V])[Symbol.iterator]()
    }

    forEach(cb: (value: V, key: K, map: this) => void): void {
        const rows = this.db.prepare(`SELECT key, value FROM map`).all() as { key: string; value: string }[]
        for (const row of rows) {
            cb(this.deserialize(row.value), row.key as K, this)
        }
    }

    toJSON(): Record<string, V> {
        const obj: Record<string, V> = {}
        const rows = this.db.prepare(`SELECT key, value FROM map`).all() as { key: string; value: string }[]
        for (const row of rows) {
            obj[row.key] = this.deserialize(row.value)
        }
        return obj
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries()
    }

    get size(): number {
        const row = this.db.prepare(`SELECT COUNT(*) AS count FROM map`).get()
        return typeof row?.count === "number" ? row.count : 0
    }

    get [Symbol.toStringTag](): string {
        return "SqliteMap"
    }

    private serialize(value: V): string {
        return JSON.stringify(value)
    }

    private deserialize(raw: string): V {
        return JSON.parse(raw) as V
    }

    private serializeKey(key: K): string {
        return String(key)
    }
}
