import { test, describe } from "node:test"
import assert from "node:assert/strict"
import { SqliteMap } from "./index"

describe("SqliteMap", () => {
    test("set and get", () => {
        const map = new SqliteMap(":memory:")
        map.set("foo", { bar: "baz" })
        assert.deepEqual(map.get("foo"), { bar: "baz" })
    })

    test("get returns undefined for missing key", () => {
        const map = new SqliteMap(":memory:")
        assert.equal(map.get("missing"), undefined)
    })

    test("has", () => {
        const map = new SqliteMap(":memory:")
        map.set("foo", 1)
        assert.equal(map.has("foo"), true)
        assert.equal(map.has("bar"), false)
    })

    test("delete", () => {
        const map = new SqliteMap(":memory:")
        map.set("foo", 1)
        assert.equal(map.delete("foo"), true)
        assert.equal(map.delete("foo"), false)
        assert.equal(map.has("foo"), false)
    })

    test("clear", () => {
        const map = new SqliteMap(":memory:")
        map.set("a", 1)
        map.set("b", 2)
        map.clear()
        assert.equal(map.size, 0)
    })

    test("size", () => {
        const map = new SqliteMap(":memory:")
        assert.equal(map.size, 0)
        map.set("a", 1)
        map.set("b", 2)
        assert.equal(map.size, 2)
        map.delete("a")
        assert.equal(map.size, 1)
    })

    test("set returns this (chaining)", () => {
        const map = new SqliteMap(":memory:")
        const result = map.set("a", 1).set("b", 2)
        assert.equal(result, map)
        assert.equal(map.size, 2)
    })

    test("getOrInsert - existing key", () => {
        const map = new SqliteMap(":memory:")
        map.set("foo", 42)
        assert.equal(map.getOrInsert("foo", 99), 42)
    })

    test("getOrInsert - missing key", () => {
        const map = new SqliteMap(":memory:")
        assert.equal(map.getOrInsert("foo", 99), 99)
        assert.equal(map.get("foo"), 99)
    })

    test("getOrInsertComputed - existing key", () => {
        const map = new SqliteMap(":memory:")
        map.set("foo", 42)
        assert.equal(
            map.getOrInsertComputed("foo", () => 99),
            42
        )
    })

    test("getOrInsertComputed - missing key", () => {
        const map = new SqliteMap(":memory:")
        assert.equal(
            map.getOrInsertComputed("foo", (k) => k.length),
            3
        )
        assert.equal(map.get("foo"), 3)
    })

    test("keys", () => {
        const map = new SqliteMap(":memory:")
        map.set("a", 1)
        map.set("b", 2)
        assert.deepEqual([...map.keys()], ["a", "b"])
    })

    test("values", () => {
        const map = new SqliteMap(":memory:")
        map.set("a", 1)
        map.set("b", 2)
        assert.deepEqual([...map.values()], [1, 2])
    })

    test("entries", () => {
        const map = new SqliteMap(":memory:")
        map.set("a", 1)
        map.set("b", 2)
        assert.deepEqual(
            [...map.entries()],
            [
                ["a", 1],
                ["b", 2]
            ]
        )
    })

    test("forEach", () => {
        const map = new SqliteMap<string, number>(":memory:")
        map.set("a", 1)
        map.set("b", 2)
        const result: [string, number][] = []
        map.forEach((value, key) => result.push([key, value]))
        assert.deepEqual(result, [
            ["a", 1],
            ["b", 2]
        ])
    })

    test("[Symbol.iterator]", () => {
        const map = new SqliteMap(":memory:")
        map.set("a", 1)
        map.set("b", 2)
        assert.deepEqual(
            [...map],
            [
                ["a", 1],
                ["b", 2]
            ]
        )
    })

    test("[Symbol.toStringTag]", () => {
        const map = new SqliteMap(":memory:")
        assert.equal(Object.prototype.toString.call(map), "[object SqliteMap]")
    })

    test("toJSON", () => {
        const map = new SqliteMap(":memory:")
        map.set("a", 1)
        map.set("b", 2)
        assert.deepEqual(map.toJSON(), { a: 1, b: 2 })
    })

    test("JSON.stringify", () => {
        const map = new SqliteMap(":memory:")
        map.set("a", 1)
        assert.equal(JSON.stringify(map), '{"a":1}')
    })

    test("overwrites existing key", () => {
        const map = new SqliteMap(":memory:")
        map.set("foo", 1)
        map.set("foo", 2)
        assert.equal(map.get("foo"), 2)
        assert.equal(map.size, 1)
    })

    test("supports complex values", () => {
        const map = new SqliteMap(":memory:")
        const val = { nested: { arr: [1, 2, 3], flag: true } }
        map.set("x", val)
        assert.deepEqual(map.get("x"), val)
    })
})
