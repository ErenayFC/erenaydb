"use strict";
const MySQLBase = require("./Base");
let logger;

class MySQLDB extends MySQLBase {
  constructor(options) {
    super(options);
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
    await this.createTableIfNotExists();
    return new Promise((resolve, reject) => {
      this.connection.query(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [db],
        (err, results) => {
          if (err) {
            logger.error("MySQL Error while getting data:", err);
            reject(err);
          } else {
            resolve(results[0] ? results[0].value : null);
          }
        }
      );
    });
  }

  async set(db, data) {
    await this.createTableIfNotExists();
    return new Promise((resolve, reject) => {
      this.connection.query(
        `INSERT INTO ${this.tableName} (id, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?`,
        [db, data, data],
        (err) => {
          if (err) {
            logger.error("MySQL Error while setting data:", err);
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  async delete(db) {
    await this.createTableIfNotExists();
    return new Promise((resolve, reject) => {
      this.connection.query(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
        [db],
        (err) => {
          if (err) {
            logger.error("MySQL Error while deleting data:", err);
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  async add(db, number) {
    await this.createTableIfNotExists();
    try {
      const currentValue = await this.get(db);
      const newValue = (parseFloat(currentValue) || 0) + number;
      return await this.set(db, newValue);
    } catch (err) {
      logger.error("MySQL Error while adding data:", err);
      return undefined;
    }
  }

  async subtract(db, number) {
    await this.createTableIfNotExists();
    try {
      const currentValue = await this.get(db);
      const newValue = (parseFloat(currentValue) || 0) - number;
      return await this.set(db, newValue);
    } catch (err) {
      logger.error("MySQL Error while subtracting data:", err);
      return undefined;
    }
  }

  async push(db, data) {
    await this.createTableIfNotExists();
    try {
      const currentValue = (await this.get(db)) || [];
      currentValue.push(data);
      return await this.set(db, currentValue);
    } catch (err) {
      logger.error("MySQL Error while pushing data:", err);
      return undefined;
    }
  }

  async unpush(db, data) {
    await this.createTableIfNotExists();
    try {
      const currentValue = (await this.get(db)) || [];
      const index = currentValue.indexOf(data);
      if (index !== -1) {
        currentValue.splice(index, 1);
        return await this.set(db, currentValue);
      } else {
        return currentValue;
      }
    } catch (err) {
      logger.error("MySQL Error while removing data:", err);
      return undefined;
    }
  }

  async delByPriority(db, number) {
    await this.createTableIfNotExists();
    try {
      const currentValue = (await this.get(db)) || [];
      currentValue.splice(number - 1, 1);
      return await this.set(db, currentValue);
    } catch (err) {
      logger.error("MySQL Error while deleting data by priority:", err);
      return undefined;
    }
  }

  async setByPriority(db, data, number) {
    await this.createTableIfNotExists();
    try {
      const currentValue = (await this.get(db)) || [];
      currentValue[number - 1] = data;
      return await this.set(db, currentValue);
    } catch (err) {
      logger.error("MySQL Error while setting data by priority:", err);
      return undefined;
    }
  }

  async all() {
    await this.createTableIfNotExists();
    return new Promise((resolve, reject) => {
      this.connection.query(`SELECT * FROM ${this.tableName}`, (err, results) => {
        if (err) {
          logger.error("MySQL Error while fetching all data:", err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  async deleteAll() {
    await this.createTableIfNotExists();
    return new Promise((resolve, reject) => {
      this.connection.query(`DELETE FROM ${this.tableName}`, (err) => {
        if (err) {
          logger.error("MySQL Error while deleting all data:", err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  async createTableIfNotExists() {
    return new Promise((resolve, reject) => {
      this.connection.query(
        `CREATE TABLE IF NOT EXISTS ${this.tableName} (id VARCHAR(255) PRIMARY KEY, value DOUBLE)`,
        (err) => {
          if (err) {
            logger.error("MySQL Error while creating table:", err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async customSQL(query, params) {
    await this.createTableIfNotExists();
    return new Promise((resolve, reject) => {
      this.connection.query(query, params, (err, results) => {
        if (err) {
          reject(logger.error("MySQL Error while executing custom SQL:", err));
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = MySQLDB;
