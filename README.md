# node-sqlite-map

A persistent `Map`-compatible API backed by SQLite using Node.js's built-in `node:sqlite` module. No external database dependencies — just a file (or `:memory:`).

## Requirements

- Node.js >= 22.5.0 (for `node:sqlite`)

## Installation

```bash
npm install node-sqlite-map
# or
pnpm add node-sqlite-map
```

## Quick Start

```typescript
import { SqliteMap } from "node-sqlite-map"

const map = new SqliteMap("./data.db")

map.set("user:1", { name: "Kyle", role: "admin" })
map.get("user:1") // { name: "Kyle", role: "admin" }
map.has("user:1") // true
map.size // 1
```

Use `:memory:` for an in-memory database that does not persist:

```typescript
const map = new SqliteMap(":memory:")
```

## API

### Constructor

```typescript
new SqliteMap<K extends string, V>(path: string, options?: DatabaseSyncOptions)
```

| Parameter | Type                  | Description                                   |
| --------- | --------------------- | --------------------------------------------- |
| `path`    | `string`              | Path to SQLite database file, or `":memory:"` |
| `options` | `DatabaseSyncOptions` | Optional Node.js `DatabaseSync` options       |

### Core Methods

#### `set(key, value): this`

Inserts or replaces a key-value pair. Returns `this` for chaining.

```typescript
map.set("a", 1).set("b", 2).set("c", 3)
```

#### `get(key): V | undefined`

Returns the value for the key, or `undefined` if not found.

```typescript
map.get("a") // 1
map.get("z") // undefined
```

#### `has(key): boolean`

Returns `true` if the key exists.

```typescript
map.has("a") // true
```

#### `delete(key): boolean`

Removes the entry. Returns `true` if it existed, `false` otherwise.

```typescript
map.delete("a") // true
map.delete("a") // false
```

#### `clear(): void`

Removes all entries.

```typescript
map.clear()
map.size // 0
```

#### `getOrInsert(key, defaultValue): V`

Returns the existing value if the key exists, otherwise inserts `defaultValue` and returns it.

```typescript
map.getOrInsert("count", 0) // inserts 0 and returns 0
map.getOrInsert("count", 99) // returns 0 (already exists)
```

#### `getOrInsertComputed(key, callbackFn): V`

Like `getOrInsert` but the default value is computed lazily via a callback — only called if the key is missing.

```typescript
map.getOrInsertComputed("slug", (key) => key.toLowerCase().replace(" ", "-"))
```

### Iteration

All iteration methods reflect the insertion order of keys.

#### `keys(): IterableIterator<K>`

```typescript
for (const key of map.keys()) console.log(key) // "a", "b", "c"
console.log([...map.keys()]) // ["a", "b", "c"]
```

#### `values(): IterableIterator<V>`

```typescript
console.log([...map.values()]) // [1, 2, 3]
```

#### `entries(): IterableIterator<[K, V]>`

```typescript
console.log([...map.entries()]) // [["a", 1], ["b", 2], ["c", 3]]
```

#### `forEach(callback): void`

```typescript
map.forEach((value, key, map) => {
    console.log(key, value)
})
```

#### `[Symbol.iterator]()`

Makes the map directly iterable — equivalent to `entries()`.

```typescript
for (const [key, value] of map) {
    console.log(key, value)
}
```

### Properties

#### `size: number`

Returns the number of entries.

```typescript
map.size // 3
```

### Serialization

#### `toJSON(): Record<string, V>`

Returns a plain object representation. Called automatically by `JSON.stringify`.

```typescript
map.set("x", 1)
map.toJSON() // { x: 1 }
JSON.stringify(map) // '{"x":1}'
```

#### `[Symbol.toStringTag]: string`

Returns `"SqliteMap"`.

```typescript
Object.prototype.toString.call(map) // "[object SqliteMap]"
```

## Type Parameters

```typescript
SqliteMap<K extends string, V>
```

| Parameter | Constraint | Description                            |
| --------- | ---------- | -------------------------------------- |
| `K`       | `string`   | Key type — must be a string            |
| `V`       | any        | Value type — must be JSON-serializable |

> Values are stored as JSON strings internally, so any JSON-serializable value is supported: objects, arrays, numbers, booleans, strings, null.

## Examples

### Persistent cache

```typescript
const cache = new SqliteMap<string, { data: unknown; expiresAt: number }>("./cache.db")

cache.getOrInsertComputed("api:users", () => ({
    data: fetchUsers(),
    expiresAt: Date.now() + 60_000
}))
```

### Counting

```typescript
const hits = new SqliteMap<string, number>("./hits.db")

hits.getOrInsert("/home", 0)
hits.set("/home", (hits.get("/home") ?? 0) + 1)
```

### Spreading / converting

```typescript
// To plain object
const obj = sqliteMap.toJSON()

// To native Map
const native = new Map(sqliteMap.entries())

// From array of entries
for (const [k, v] of entries) sqliteMap.set(k, v)
```

## Differences from native `Map`

| Feature          | `Map`             | `SqliteMap`       |
| ---------------- | ----------------- | ----------------- |
| Persistence      | ❌ In-memory only | ✅ File-backed    |
| Key type         | Any               | `string` only     |
| Value type       | Any               | JSON-serializable |
| Iteration order  | Insertion order   | Insertion order   |
| `JSON.stringify` | `{}` (empty)      | ✅ Full object    |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links & Community

| Resource          | URL                                             |
| ----------------- | ----------------------------------------------- |
| GitHub repository | https://github.com/xcfio/node-sqlite-map        |
| npm package       | https://www.npmjs.com/package/node-sqlite-map   |
| Homepage          | https://github.com/xcfio/node-sqlite-map#readme |
| Bug reports       | https://github.com/xcfio/node-sqlite-map/issues |

### Discord

Join the community on Discord for help, and discussion:

**https://discord.gg/FaCCaFM74Q**

---

Made with ❤️ by [xcfio](https://github.com/xcfio)
