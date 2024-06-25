"use strict";
const Base = require("./Base");
const Schema = require("./Schema");
const functions = require("../../functions/mongo");
const _ = require('lodash');

class MongoDB extends Base {
  constructor(options) {
    super(options.mongoOptions["url"]);
    this.schema = options.schema ? Schema(options.schema) : Schema("ErenayDB");
  }

  async set(db, data) {
    if (db.includes(".")) {
      var content = await this.schema.findOne({
        key: db.split(".").shift(),
      });

      if (!content) {
        var content = {};
        functions.set(db.split(".").slice(1).join("."), data, content);
        await this.schema.findOneAndUpdate(
          { key: db.split(".").shift() },
          { value: content },
          { upsert: true }
        );

        return data;
      } else {
        const prev = Object.assign({}, content.value);
        functions.set(db.split(".").slice(1).join("."), data, prev);
        await this.schema.findOneAndUpdate(
          { key: db.split(".").shift() },
          { value: prev },
          { upsert: true }
        );
        return data;
      }
    } else {
      await this.schema.findOneAndUpdate(
        { key: db },
        { value: data },
        { upsert: true }
      );
      return data;
    }
  }

  async get(db) {
    if (db.includes(".")) {
      let content = await this.schema.findOne({
        key: db.split(".").shift(),
      });
      if (!content) return undefined;
      return functions.get(content.value, ...db.split(".").slice(1));
    } else {
      let content = await this.schema.findOne({
        key: db,
      });
      if (!content) return undefined;
      return content.value;
    }
  }

  async fetch(db) {
    return await this.get(db);
  }

  async has(db) {
    return (await this.get(db)) ? true : false;
  }

  async delete(db) {
    if (db.includes(".")) {
      let content = await this.get(db.split(".").shift());
      if (!content) return true;
      const newContent = Object.assign({}, content);
      functions.remove(newContent, db.split(".").slice(1).join("."));
      this.set(db.split(".").shift(), newContent);
      setTimeout(async () => {
        var newData = await this.get(
          db
            .split(".")
            .slice(0, db.split(".").length - 1)
            .join(".")
        );
        if (typeof newData === "object") {
          if (Object.keys(newData).length === 0) {
            await this.delete(
              db
                .split(".")
                .slice(0, db.split(".").length - 1)
                .join(".")
            );
          }
        }
      }, 500);
    } else {
      await this.schema.findOneAndDelete({
        key: db,
      });
    }
    return true;
  }

  async add(db, number) {
    let content = await this.get(db);

    if (!content) {
      await this.set(db, number);
      return number;
    } else {
      await this.set(db, content + number);

      return content + number;
    }
  }

  async subtract(db, number) {
    const content = await this.get(db);

    let newNumber = content - number;

    if (!isNaN(content)) {
      if (newNumber <= 0) {
        await this.delete(db);
        return 0;
      } else {
        return await this.set(db, newNumber);
      }
    } else {
      return 0;
    }
  }

  async push(db, data) {
    var arr = [];

    if (await this.get(db)) {
      if (typeof (await this.get(db)) !== "object") {
        arr = [];
      } else {
        arr = await this.get(db);
      }
    }

    arr.push(data);

    await this.set(db, arr);

    return await this.get(db);
  }

  // async unpush(db, data) {
  //   var beforeData = await this.get(db) || [];
  //   if (Array.isArray(beforeData) && beforeData.length > 0) {
  //     console.log(data)
  //     var arr = beforeData.filter((x) => x !== data);
  //     console.log(arr)
  //     await this.set(db, arr);
  //   }
  //   return this.get(db);
  // }
  async unpush(db, data) {
    var beforeData = Object.values(await this.get(db)) || [];
    if (Array.isArray(beforeData)) {
      const index = beforeData.findIndex(item => _.isEqual(item, data));
      if (index > -1) {
        const newArr = [
          ...beforeData.slice(0, index),
          ...beforeData.slice(index + 1)
        ];
        await this.set(db, newArr);
      }
    }
    return this.get(db);
}


  async delByPriority(db, number) {
    if (!(await this.get(db)) || (await this.get(db)).length < 1) {
      return false;
    }

    let content = await this.get(db);
    let neww = [];

    if (typeof content !== "object") {
      return false;
    }

    for (let a = 0; a < content.length; a++) {
      if (a !== number - 1) {
        neww.push(content[`${a}`]);
      }
    }

    await this.set(db, neww);
    return await this.get(db);
  }

  async setByPriority(db, data, number) {
    if (!(await this.get(db)) || (await this.get(db)).length < 1) {
      return false;
    }

    let content = await this.get(db);
    let neww = [];

    if (typeof content !== "object") {
      return false;
    }

    for (let a = 0; a < content.length; a++) {
      let val = content[`${a}`];

      if (a === number - 1) {
        neww.push(data);
      } else {
        neww.push(val);
      }
    }

    await this.set(db, neww);
    return await this.get(db);
  }

  async all() {
    let data = await this.schema.find({});
    let content = Object.values(data).map((x) => x.value)[0];
    return content;
  }

  async deleteAll() {
    await this.schema.deleteMany();

    return true;
  }
  async disconnect() {
    return new Promise((resolve, reject) => {
      try {
        this._destroyDatabase();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = MongoDB;
