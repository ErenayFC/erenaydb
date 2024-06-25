# ErenayDB

![Download](https://img.shields.io/npm/dt/erenaydb.svg?style=flat-square) ![Download](https://img.shields.io/npm/dm/erenaydb.svg?style=flat-square) ![Download](https://img.shields.io/npm/dw/erenaydb.svg?style=flat-square) ![License](https://img.shields.io/npm/l/erenaydb.svg?style=flat-square)

## What's New In 0.0.7?

### Added MySQL Adapter

Examples

> (QuickDB) Moving Everything to ErenayDB

```js
const db = require("erenaydb");
const quickdb = require("quick.db");

await db.move(quickdb)
```

> (JsonDB) Moving Everything to MongoDB

```js
const db = require("erenaydb");
db.setAdapter("mongo", {url: "YOUR_MONGO_URL"})
const JsonDB = require("../your_file.json");

db.moveToMongo(JsonDB)
```

> Example

```js
const db = require("erenaydb")

db.set("x.y.z", "abc") // abc

db.get("x") // {y: {z: "abc"}}
db.fetch("x") // {y: {z: "abc"}}
db.all() // {x: {y: {z: "abc"}}}

db.push("a", "hello") //  ["hello"]
db.push("a", "world") //  ["hello", "world"]
db.unpush("a", "hello") // ["world"]

db.push("b", {test: "erenaydb"}) // [{test: "erenaydb"}]
db.push("b", {test2: "erenaydb2"}) // [{test: "erenaydb"}, {test2: "erenaydb2"}]
db.delByPriority("b", 1) // [{test2: "erenaydb"}]
db.setByPriority("b", {newtest:"hey this is edited"}, 1) // [{newtest:"hey this is edited"}]

db.has("x") // true
db.delete("x") // true
db.deleteAll() // true
```

> MySQL Support(BETA) (If you find any bugs/issues join my [Discord](https://discord.gg/WSvd3E6CNn))

```js
const db = require("erenaydb");

db.setCheckUpdates(true);
db.setAdapter("mysql", {
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
  database: "erenaydb_test"
});
db.connect();
setTimeout(async () => {
  try {
    await db.add("x", 1);
    await db.add("y", 2);
    await db.add("z", 3);
    const result = await db.all();
    console.log(result);
    
    // Example custom SQL usage
    const customResult = await db.customSQL("SELECT * FROM ErenayDB WHERE id = ?", ["y"]);
    console.log(customResult);
  } catch (error) {
    console.error("Error while performing database operations:", error);
  }

  await erenaydb.disconnect();
}, 2000);
```

> RethinkDB Supporting!

```js
const db = require("erenaydb")
db.setAdapter("rethink", 
{
    host: "localhost",
    port: 28015,
    db: "ErenayDB_Test",
    schema: "Schema Name" // Not required. You can't define your own schema. Just name.
})

await db.set("x.y.z", "abc") // abc

await db.get("x") // {y: {z: "abc"}}
await db.fetch("x") // {y: {z: "abc"}}
await db.all().then((result) => console.log(result))  // {x: {y: {z: "abc"}}}

await db.push("a", "hello") //  ["hello"]
await db.push("a", "world") //  ["hello", "world"]
await db.unpush("a", "hello") // ["world"]

await db.push("b", {test: "erenaydb"}) // [{test: "erenaydb"}]
await db.push("b", {test2: "erenaydb2"}) // [{test: "erenaydb"}, {test2: "erenaydb2"}]
await db.delByPriority("b", 1) // [{test2: "erenaydb"}]
await db.setByPriority("b", {newtest:"hey this is edited"}, 1) // [{newtest:"hey this is edited"}]

await db.has("x") // true
await db.delete("x") // true
await db.deleteAll() // true
```

MongoDb! (If you find any bugs/issues join my [Discord](https://discord.gg/WSvd3E6CNn))

```js
const db = require("erenaydb")
db.setAdapter("mongo", 
{
    url: "Your Mongo URL", 
    schema: "Schema Name" // Not required. You can't define your own schema. Just name.
})

await db.set("x.y.z", "abc") // abc

await db.get("x") // {y: {z: "abc"}}
await db.fetch("x") // {y: {z: "abc"}}
await db.all() // {x: {y: {z: "abc"}}}

await db.push("a", "hello") //  ["hello"]
await db.push("a", "world") //  ["hello", "world"]
await db.unpush("a", "hello") // ["world"]

await db.push("b", {test: "erenaydb"}) // [{test: "erenaydb"}]
await db.push("b", {test2: "erenaydb2"}) // [{test: "erenaydb"}, {test2: "erenaydb2"}]
await db.delByPriority("b", 1) // [{test2: "erenaydb"}]
await db.setByPriority("b", {newtest:"hey this is edited"}, 1) // [{newtest:"hey this is edited"}]

await db.has("x") // true
await db.delete("x") // true
await db.deleteAll() // true
```

> Example With Options

```js
const db = require("erenaydb")
db.setReadable(true) // It makes readable your JSON DB file.
db.noBlankData(true) // If you delete anything from object and new object size is less than 1, automaticly removes that object.
db.setAdapter("yamldb") // It makes adapter as YAML adapter. Default adapter is JsonDB
db.setFolder("folder") // You can set database folder name
db.setFile("db") // You can set database file name
db.setCheckUpdates(true) // It warns you if any updates happens.

db.set("x.y.z", "abc") // abc

db.get("x") // {y: {z: "abc"}}
db.fetch("x") // {y: {z: "abc"}}
db.all() // {x: {y: {z: "abc"}}}

db.push("a", "hello") //  ["hello"]
db.push("a", "world") //  ["hello", "world"]
db.unpush("a", "hello") // ["world"]

db.push("b", {test: "erenaydb"}) // [{test: "erenaydb"}]
db.push("b", {test2: "erenaydb2"}) // [{test: "erenaydb"}, {test2: "erenaydb2"}]
db.delByPriority("b", 1) // [{test2: "erenaydb"}]
db.setByPriority("b", {newtest:"hey this is edited"}, 1) // [{newtest:"hey this is edited"}]

db.has("x") // true
db.delete("x") // true
db.deleteAll() // true
```

If you've any question, you can join to my Discord server: [Click me!](https://discord.gg/WSvd3E6CNn)
