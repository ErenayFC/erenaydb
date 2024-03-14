"use strict";
const RethinkBase = require("./Base");
const r = require("rethinkdb");

class RethinkDB extends RethinkBase {
  constructor(options) {
    super(options);
    this.connection = null;
    this.tableName = options.schema || "JSON";
    this.options = options;
    this.debug = options.debugMode || false;
  }

  disconnect() {
    if (this.connection && this.connection.open) {
      return this.connection.close().then(() => {
        if (this.debug) {
          console.log("[ErenayDB] Successfully Disconnected From RethinkDB.");
        }
      });
    }
  }

  async get(db) {
    await check(this.tableName, this.connection);
    try {
      const result = await r.table(this.tableName).get(db).run(this.connection);
      if (this.debug) {
        console.log("[ErenayDB] RethinkDB Data fetched successfully.");
      }
      return result != null ? result.value : null;
    } catch (err) {
      console.error("[ErenayDB] RethinkDB Error while getting data:", err);
      return undefined;
    }
  }

  async set(db, data) {
    try {
      const document = await r
        .table(this.tableName)
        .get(db)
        .run(this.connection);

      if (document) {
        await r
          .table(this.tableName)
          .get(db)
          .update({ value: data })
          .run(this.connection);

        if (this.debug) {
          console.log("[ErenayDB] RethinkDB Data updated successfully.");
        }
      } else {
        await r
          .table(this.tableName)
          .insert({ id: db, value: data })
          .run(this.connection);

        if (this.debug) {
          console.log("[ErenayDB] RethinkDB Data inserted successfully.");
        }
      }

      return true;
    } catch (err) {
      console.error("[ErenayDB] RethinkDB Error while setting data:", err);
      return undefined;
    }
  }

  async delete(db) {
    await check(this.tableName, this.connection);
    try {
      await r.table(this.tableName).get(db).delete().run(this.connection);
      if (this.debug) {
        console.log("[ErenayDB] RethinkDB Data deleted successfully.");
      }
      return true;
    } catch (err) {
      console.error("[ErenayDB] RethinkDB Error while deleting data:", err);
      return false;
    }
  }

  async fetch(db) {
    return await this.get(db);
  }

  async has(db) {
    await check(this.tableName, this.connection);
    try {
      const result = await this.get(db);
      if (this.debug) {
        console.log("[ErenayDB] RethinkDB Data checked succesfully.");
      }
      return !!result;
    } catch (err) {
      console.error(
        "[ErenayDB] RethinkDB Error while checking data existence:",
        err
      );
      return false;
    }
  }

  async add(db, number) {
    await check(this.tableName, this.connection);
    try {
      const result = await this.get(db);
      const newValue = (result || 0) + number;
      if (this.debug) {
        console.log("[ErenayDB] RethinkDB Data added successfully.");
      }
      return await this.set(db, newValue);
    } catch (err) {
      console.error("[ErenayDB] RethinkDB Error while adding data:", err);
      return undefined;
    }
  }

  async subtract(db, number) {
    await check(this.tableName, this.connection);
    try {
      const result = await this.get(db);
      const newValue = (result || 0) - number;
      if (this.debug) {
        console.log("[ErenayDB] RethinkDB Data subtracted successfully.");
      }
      return await this.set(db, newValue);
    } catch (err) {
      console.error("[ErenayDB] RethinkDB Error while subtracting data:", err);
      return undefined;
    }
  }

  async push(db, data) {
    await check(this.tableName, this.connection);
    try {
      const result = await this.get(db);
      const newData = result || [];
      newData.push(data);
      if (this.debug) {
        console.log("[ErenayDB] RethinkDB Data inserted successfully.");
      }
      return await this.set(db, newData);
    } catch (err) {
      console.error("[ErenayDB] RethinkDB Error while pushing data:", err);
      return undefined;
    }
  }

  async unpush(db, data) {
    await check(this.tableName, this.connection);
    return this.get(db)
      .then((result) => {
        const newData = result || [];
        const index = newData.indexOf(data);
        console.log(index);
        if (index !== -1) {
          newData.splice(index, 1);
          console.log(newData, index);
          return this.set(db, newData);
        }
        if (this.debug) {
          console.log("[ErenayDB] RethinkDB Data removed successfully.");
        }
        return newData;
      })
      .catch((err) => {
        console.error("[ErenayDB] RethinkDB Error while removing data:", err);
        return undefined;
      });
  }

  async delByPriority(db, number) {
    await check(this.tableName, this.connection);
    return this.get(db)
      .then((result) => {
        const newData = result || [];
        newData.splice(number - 1, 1);
        return this.set(db, newData);
      })
      .catch((err) => {
        console.error(
          "[ErenayDB] RethinkDB Error while deleting data by priority:",
          err
        );
        return undefined;
      });
  }

  async setByPriority(db, data, number) {
    await check(this.tableName, this.connection);
    return this.get(db)
      .then((result) => {
        const newData = result || [];
        newData[number - 1] = data;
        return this.set(db, newData);
      })
      .catch((err) => {
        console.error(
          "[ErenayDB] RethinkDB Error while setting data by priority:",
          err
        );
        return undefined;
      });
  }

  async all() {
    await check(this.tableName, this.connection);
    try {
      const cursor = await r.table(this.tableName).run(this.connection);
      return await cursor.toArray();
    } catch (err) {
      console.error(
        "[ErenayDB] RethinkDB Error while fetching all data with find query:",
        err
      );
    }
  }

  async deleteAll() {
    await check(this.tableName, this.connection);
    return r
      .table(this.tableName)
      .delete()
      .run(this.connection)
      .then(() => {
        if (this.debug) {
          console.log("[ErenayDB] RethinkDB All data deleted successfully.");
        }
        return true;
      })
      .catch((err) => {
        console.error(
          "[ErenayDB] RethinkDB Error while deleting all data:",
          err
        );
        return false;
      });
  }
}
async function check(table, connection) {
  const tableExists = await r.tableList().contains(table).run(connection);
  if (!tableExists) {
    await r.tableCreate(table).run(connection);
    console.log(
      "[ErenayDB] RethinkDB New table was created with named as '" + table + "'"
    );
  }
}
module.exports = RethinkDB;
