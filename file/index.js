const langs = ["tr", "en"];
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  setOptions() {
    var adapter = this.adapter || require("../adapters/jsondb");
    if (this.mongoOptions?.schema || this.rethinkOptions?.schema) {
      this.isSpecialSchema = true;
    } else {
      this.isSpecialSchema = false;
    }

    this.options = {
      dbName: this.file || "erenaydb",
      dbFolder: this.folder || "erenaydb",
      noBlankData: this.noBlankData || false,
      readable: this.readable || false,
      language: this.lang ? this.lang : "en",
      isMongo: this.isMongo,
      isRethink: this.isRethink,
      mongoOptions: this.mongoOptions || {},
      rethinkOptions: this.rethinkOptions || {},
      isSpecialSchema: this.isSpecialSchema,
      checkUpdates: this.checkUpdates !== false,
    };

    this.message = this.lang
      ? require(`../language/${this.lang.toLowerCase()}.json`)
      : require(`../language/en.json`);

    this.adapter = adapter.set
      ? adapter
      : this.mongo
      ? this.options.rethinkdb
        ? new adapter(this.options.rethinkdb)
        : new adapter(this.options.mongoOptions)
      : new adapter(this.options);

    if (this.checkUpdates) {
      try {
        fetch("https://registry.npmjs.org/erenay.db/latest").then(
          async (res) => {
            res.json().then((data) => {
              if (require("../package.json").version !== data.version) {
                console.warn(this.message["errors"]["oldVersion"]);
              }
            });
          }
        );
      } catch (err) {
        // Handle error
      }
    }
  },

  setCheckUpdates(a) {
    if (a === true) {
      this.checkUpdates = true;
      this.setOptions();
      return a;
    } else {
      this.checkUpdates = false;
      this.setOptions();
      return false;
    }
  },

  setLanguage(lang) {
    this.lang = lang
      ? langs.includes(lang.toLowerCase())
        ? lang.toLowerCase()
        : "en"
      : "en";
    this.message = require(`../language/${this.lang.toLowerCase()}.json`);
    this.setOptions();
    return lang;
  },

  deleteMongo() {
    var adapter = require("../adapters/jsondb");
    this.adapter = adapter;
    this.mongo = false;
    this.setOptions();
  },

  setAdapter(adapter, options = {}) {
    if (adapter !== "mongo" && adapter !== "rethink") {
      var adapterModule =
        require("../adapters/" + adapter) || require("../adapters/jsondb");
      this.adapter = adapterModule;
      this.mongo = false;
      this.rethink = false;
      this.setOptions();
    } else if (adapter === "mongo") {
      try {
        require("mongoose");
      } catch (error) {
        throw new TypeError(
          'You must install "mongoose" modules to use this adapter.'
        );
      }
      var mongoAdapter = require("../adapters/mongo/index");
      this.mongo = true;
      this.rethink = false;
      this.adapter = mongoAdapter;
      this.mongoOptions = options;
      this.setOptions();
    } else if (adapter === "rethink") {
      try {
        require("rethinkdb");
      } catch (error) {
        throw new TypeError(
          'You must install "rethinkdb" modules to use this adapter.'
        );
      }
      const RethinkDB = require("../adapters/rethinkdb/index");
      this.rethink = true;
      this.mongo = false;
      this.adapter = RethinkDB;
      this.rethinkOptions = options;
      this.setOptions();
    } else {
      this.adapter = this.setOptions();
    }
  },

  setFolder(folder) {
    this.folder = folder;
    this.setOptions();
    return true;
  },

  setFile(file) {
    this.file = file;
    this.setOptions();
    return true;
  },

  setReadable(boolean) {
    this.readable = boolean
      ? typeof boolean === "boolean"
        ? true
        : false
      : false;
    this.setOptions();
    return this.readable;
  },

  setNoBlankData(boolean) {
    this.noBlankData = boolean
      ? typeof boolean === "boolean"
        ? boolean
        : false
      : false;
    this.setOptions();
    return this.noBlankData;
  },

  set(db, data) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if (!data) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    return this.adapter.set(db, data);
  },

  async get(db) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }
    try {
      const result = await this.adapter.get(db);
      console.log(result, "aaaaaaaaaaa");
      return result;
    } catch (err) {
      return undefined;
    }
  },

  async fetch(db) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    try {
      return await this.adapter.get(db);
    } catch (err) {
      return undefined;
    }
  },

  async has(db) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    try {
      return await this.adapter.has(db);
    } catch (err) {
      return false;
    }
  },

  async delete(db) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    try {
      return await this.adapter.delete(db);
    } catch (err) {
      return false;
    }
  },

  async add(db, number) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if (!number) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if (isNaN(number)) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    return await this.adapter.add(db, number);
  },

  async subtract(db, number) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if (!number) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if (isNaN(number)) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    return await this.adapter.subtract(db, number);
  },

  async push(db, data) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if (!data) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    return await this.adapter.push(db, data);
  },

  async unpush(db, data) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if (!data) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    return await this.adapter.unpush(db, data);
  },

  async delByPriority(db, number) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if (!number) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if (isNaN(number)) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    return await this.adapter.delByPriority(db, number);
  },

  async setByPriority(db, data, number) {
    this.setOptions();
    if (!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if (!data) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if (!number) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if (isNaN(number)) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    return await this.adapter.delByPriority(db, number);
  },

  async all() {
    this.setOptions();
    return await this.adapter.all();
  },

  async deleteAll() {
    this.setOptions();
    return await this.adapter.deleteAll();
  },

  async moveToQuickDB(quickDB) {
    console.log("QuickDB to ErenayDB(JsonDB): Started copying database.");
    await quickDB.fetchAll().map(async (data) => {
      await this.adapter.set(data.ID, data.data);
      console.log(`QuickDB to ErenayDB(JsonDB): Copied ${data.ID}`);
    });
    return true;
  },

  async moveToMongoDB(JsonDB) {
    console.log(
      "[ErenayDB] JsonDB to ErenayDB(MongoDB): Started copying database."
    );
    Object.keys(JsonDB).map(async (data) => {
      await this.adapter.set(data, JsonDB[data]);
      console.log(`[ErenayDB] JsonDB to ErenayDB(MongoDB): Copied ${data}`);
    });
    return true;
  },

  async moveToRethinkDB(JsonDB) {
    console.log(
      "[ErenayDB] JsonDB to ErenayDB(RethinkDB): Started copying database."
    );
    for (const id in JsonDB) {
      if (JsonDB.hasOwnProperty(id)) {
        const value = JsonDB[id];
        await this.adapter.set(id, { id, value });
        console.log(`[ErenayDB] JsonDB to ErenayDB(RethinkDB): Copied ${id}`);
      }
    }

    return true;
  },
};
