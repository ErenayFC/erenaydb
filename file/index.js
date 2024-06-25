const langs = ["tr", "en"];
let fetch;
let logger;

module.exports = {
  setOptions() {
    return new Promise(async (resolve, reject) => {
      try {
        fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
        logger = require("../logger/logger");
      } catch (err) {
        console.error(
          'Please install "logging" and "node-fetch" modules. Use this command to install: "npm i logging node-fetch"'
        );
      }

      this.options = {
        dbName: this.file || "erenaydb",
        dbFolder: this.folder || "erenaydb",
        noBlankData: this.noBlankData || false,
        readable: this.readable || false,
        language: this.lang ? this.lang : "en",
        isMongo: this.mongo,
        isRethink: this.rethink,
        isMySQL: this.mysql,
        mongoOptions: this.mongoOptions || {},
        rethinkOptions: this.rethinkOptions || {},
        mysqlOptions: this.mysqlOptions || {},
        checkUpdates: this.checkUpdates !== false,
        schema: this.mongoOptions?.schema || this.rethinkOptions?.db,
        message: this.message
      };

      this.message = this.lang
        ? require(`../language/${this.lang.toLowerCase()}.json`)
        : require(`../language/en.json`);

      resolve();
    });
  },

  connect() {
    return new Promise(async (resolve, reject) => {
      if (!this.isConnected) {
        let adapter;
        if (this.mongo) {
          adapter = require("../adapters/mongo/index");
        } else if (this.rethink) {
          adapter = require("../adapters/rethinkdb/index");
        } else if (this.mysql) {
          adapter = require("../adapters/mysql/index");
        } else {
          adapter = require("../adapters/jsondb");
        }

        this.adapter = new adapter(this.options);
        this.isConnected = true;
      }

      if (this.checkUpdates) {
        try {
          const res = await fetch("https://registry.npmjs.org/erenaydb/latest");
          const data = await res.json();
          if (require("../package.json").version !== data.version) {
            logger.warn(this.message["errors"]["oldVersion"]);
          }
        } catch (err) {
          // Handle error
        }
      }
      resolve();
    });
  },

  setCheckUpdates(a) {
    this.checkUpdates = !!a;
    this.setOptions();
    return this.checkUpdates;
  },

  disconnect() {
    return new Promise(async (resolve, reject) => {
      if (this.adapter && this.adapter.disconnect) {
        await this.adapter.disconnect();
        this.isConnected = false;
        resolve(true);
      } else {
        logger.error("Please use a proper adapter to disconnect!");
        resolve(false);
      }
    });
  },

  setLanguage(lang) {
    return new Promise(async (resolve, reject) => {
      this.lang = langs.includes(lang.toLowerCase()) ? lang.toLowerCase() : "en";
      this.message = require(`../language/${this.lang.toLowerCase()}.json`);
      await this.setOptions();
      resolve(lang);
    });
  },

  deleteMongo() {
    return new Promise(async (resolve, reject) => {
      const adapter = require("../adapters/jsondb");
      this.adapter = adapter;
      this.mongo = false;
      await this.setOptions();
      resolve();
    });
  },

  setAdapter(adapter, options = {}) {
    return new Promise(async (resolve, reject) => {
      this.isConnected = false; // Reset connection status

      if (adapter !== "mongo" && adapter !== "rethink" && adapter !== "mysql") {
        const adapterModule = require("../adapters/" + adapter) || require("../adapters/jsondb");
        this.adapter = adapterModule;
        this.mongo = false;
        this.rethink = false;
        this.mysql = false;
      } else if (adapter === "mongo") {
        try {
          require("mongoose");
        } catch (error) {
          throw new TypeError('You must install "mongoose" modules to use this adapter.');
        }
        const mongoAdapter = require("../adapters/mongo/index");
        this.mongo = true;
        this.rethink = false;
        this.mysql = false;
        this.adapter = mongoAdapter;
        this.mongoOptions = options;
      } else if (adapter === "rethink") {
        try {
          require("rethinkdb");
        } catch (error) {
          throw new TypeError('You must install "rethinkdb" modules to use this adapter.');
        }
        const RethinkDB = require("../adapters/rethinkdb/index");
        this.rethink = true;
        this.mongo = false;
        this.mysql = false;
        this.adapter = RethinkDB;
        this.rethinkOptions = options;
      } else if (adapter === "mysql") {
        try {
          require("mysql2");
        } catch (error) {
          throw new TypeError('You must install "mysql2" modules to use this adapter.');
        }
        const MySQL = require("../adapters/mysql/index");
        this.mysql = true;
        this.mongo = false;
        this.rethink = false;
        this.adapter = MySQL;
        this.mysqlOptions = options;
      }
      await this.setOptions();
      resolve();
    });
  },

  setFolder(folder) {
    return new Promise(async (resolve, reject) => {
      this.folder = folder;
      await this.setOptions();
      resolve(true);
    });
  },

  setFile(file) {
    return new Promise(async (resolve, reject) => {
      this.file = file;
      await this.setOptions();
      resolve(true);
    });
  },

  setReadable(boolean) {
    return new Promise(async (resolve, reject) => {
      this.readable = typeof boolean === "boolean" ? boolean : false;
      await this.setOptions();
      resolve(this.readable);
    });
  },

  setNoBlankData(boolean) {
    return new Promise(async (resolve, reject) => {
      this.noBlankData = typeof boolean === "boolean" ? boolean : false;
      await this.setOptions();
      resolve(this.noBlankData);
    });
  },

  set(db, data) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      if (!data) {
        return reject(new TypeError(this.message["errors"]["blankData"]));
      }

      try {
        const result = await this.adapter.set(db, data);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  get(db) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      try {
        const result = await this.adapter.get(db);
        resolve(result);
      } catch (err) {
        resolve(undefined);
      }
    });
  },

  fetch(db, alternativeValue) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      try {
        const result = await this.adapter.get(db) ?? alternativeValue;
        resolve(result);
      } catch (err) {
        resolve(undefined);
      }
    });
  },

  has(db) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      try {
        const result = await this.adapter.has(db);
        resolve(result);
      } catch (err) {
        resolve(false);
      }
    });
  },

  delete(db) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      try {
        const result = await this.adapter.delete(db);
        resolve(result);
      } catch (err) {
        resolve(false);
      }
    });
  },

  add(db, number) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      if (!number) {
        return reject(new TypeError(this.message["errors"]["blankData"]));
      }

      if (isNaN(number)) {
        return reject(new TypeError(this.message["errors"]["blankNumber"]));
      }

      try {
        const result = await this.adapter.add(db, number);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  subtract(db, number) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      if (!number) {
        return reject(new TypeError(this.message["errors"]["blankData"]));
      }

      if (isNaN(number)) {
        return reject(new TypeError(this.message["errors"]["blankNumber"]));
      }

      try {
        const result = await this.adapter.subtract(db, number);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  push(db, data) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      if (!data) {
        return reject(new TypeError(this.message["errors"]["blankData"]));
      }

      try {
        const result = await this.adapter.push(db, data);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  unpush(db, data) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      if (!data) {
        return reject(new TypeError(this.message["errors"]["blankData"]));
      }

      try {
        const result = await this.adapter.unpush(db, data);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  delByPriority(db, number) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      if (!number) {
        return reject(new TypeError(this.message["errors"]["blankData"]));
      }

      if (isNaN(number)) {
        return reject(new TypeError(this.message["errors"]["blankNumber"]));
      }

      try {
        const result = await this.adapter.delByPriority(db, number);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  setByPriority(db, data, number) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!db) {
        return reject(new TypeError(this.message["errors"]["blankName"]));
      }

      if (!data) {
        return reject(new TypeError(this.message["errors"]["blankData"]));
      }

      if (!number) {
        return reject(new TypeError(this.message["errors"]["blankData"]));
      }

      if (isNaN(number)) {
        return reject(new TypeError(this.message["errors"]["blankNumber"]));
      }

      try {
        const result = await this.adapter.setByPriority(db, data, number);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  all() {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      try {
        const result = await this.adapter.all();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  deleteAll() {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      try {
        const result = await this.adapter.deleteAll();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  customSQL(query, params) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      if (!this.mysql) {
        return reject(new TypeError(logger.error(this.message["errors"]["notMySQL"])));
      }

      try {
        const result = await this.adapter.customSQL(query, params);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  moveToQuickDB(quickDB) {
    return new Promise(async (resolve, reject) => {
      await this.connect();
      console.log("QuickDB to ErenayDB(JsonDB): Started copying database.");
      try {
        await quickDB.fetchAll().map(async (data) => {
          await this.adapter.set(data.ID, data.data);
          console.log(`QuickDB to ErenayDB(JsonDB): Copied ${data.ID}`);
        });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  async moveToMongoDB(JsonDB) {
    await this.connect();
    console.log("JsonDB to ErenayDB(MongoDB): Started copying database.");
    Object.keys(JsonDB).map(async (data) => {
      await this.adapter.set(data, JsonDB[data]);
      console.log(`JsonDB to ErenayDB(MongoDB): Copied ${data}`);
    });
    return true;
  },

  async moveToRethinkDB(JsonDB) {
    await this.connect();
    console.log("JsonDB to ErenayDB(RethinkDB): Started copying database.");
    for (const id in JsonDB) {
      if (JsonDB.hasOwnProperty(id)) {
        const value = JsonDB[id];
        await this.adapter.set(id, { id, value });
        console.log(`JsonDB to ErenayDB(RethinkDB): Copied ${id}`);
      }
    }

    return true;
  },

  async moveToMySQL(JsonDB) {
    await this.connect();
    console.log("JsonDB to ErenayDB(MySQL): Started copying database.");
    for (const id in JsonDB) {
      if (JsonDB.hasOwnProperty(id)) {
        const value = JsonDB[id];
        await this.adapter.set(id, value);
        console.log(`JsonDB to ErenayDB(MySQL): Copied ${id}`);
      }
    }
    return true;
  },
};