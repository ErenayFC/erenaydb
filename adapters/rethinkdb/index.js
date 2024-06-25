"use strict";
const RethinkBase = require("./Base");
const r = require("rethinkdb");
let logger;

class RethinkDB extends RethinkBase {
  constructor(options) {
    super(options);
    this.connection = null;
    this.tableName = options.schema || "ErenayDB";
    this.options = options;
    try {
      logger = require("../../logger/logger");
    } catch (err) {
      console.error(
        'Please install "logging" modules. Use this command to install: "npm i logging"'
      );
    }
  }

  async disconnect() {
    return new Promise((resolve, reject) => {
      try {
        this.closeConnection();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  async get(db) {
    await check(this.tableName, this.connection);
    try {
      const result = await r.table(this.tableName).get(db).run(this.connection);
      return result != null ? result.value : null;
    } catch (err) {
      logger.error("RethinkDB Error while getting data:", err);
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
      } else {
        await r
          .table(this.tableName)
          .insert({ id: db, value: data })
          .run(this.connection);
      }

      return true;
    } catch (err) {
      logger.error("RethinkDB Error while setting data:", err);
      return undefined;
    }
  }

  async delete(db) {
    await check(this.tableName, this.connection);
    try {
      await r.table(this.tableName).get(db).delete().run(this.connection);
      return true;
    } catch (err) {
      logger.error("RethinkDB Error while deleting data:", err);
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
      return !!result;
    } catch (err) {
      logger.error("RethinkDB Error while checking data existence:", err);
      return false;
    }
  }

  async add(db, number) {
    await check(this.tableName, this.connection);
    try {
      const result = await this.get(db);
      const newValue = (result || 0) + number;
      return await this.set(db, newValue);
    } catch (err) {
      logger.error("RethinkDB Error while adding data:", err);
      return undefined;
    }
  }

  async subtract(db, number) {
    await check(this.tableName, this.connection);
    try {
      const result = await this.get(db);
      const newValue = (result || 0) - number;
      return await this.set(db, newValue);
    } catch (err) {
      logger.error("RethinkDB Error while subtracting data:", err);
      return undefined;
    }
  }

  async push(db, data) {
    await check(this.tableName, this.connection);
    try {
      const result = await this.get(db);
      const newData = result || [];
      newData.push(data);
      return await this.set(db, newData);
    } catch (err) {
      logger.error("RethinkDB Error while pushing data:", err);
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
        return newData;
      })
      .catch((err) => {
        logger.error("RethinkDB Error while removing data:", err);
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
        logger.error("RethinkDB Error while deleting data by priority:", err);
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
        logger.error("RethinkDB Error while setting data by priority:", err);
        return undefined;
      });
  }

  async all() {
    await check(this.tableName, this.connection);
    try {
      const cursor = await r.table(this.tableName).run(this.connection);
      return await cursor.toArray();
    } catch (err) {
      logger.error(
        "RethinkDB Error while fetching all data with find query:",
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
        return true;
      })
      .catch((err) => {
        logger.error("RethinkDB Error while deleting all data:", err);
        return false;
      });
  }
}
async function check(table, connection) {
  const tableExists = await r.tableList().contains(table).run(connection);
  if (!tableExists) {
    await r.tableCreate(table).run(connection);
    logger.info(
      "RethinkDB New table was created with named as '" + table + "'"
    );
  }
}
module.exports = RethinkDB;
