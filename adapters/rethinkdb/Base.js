// Base.js

const EventEmitter = require("events").EventEmitter;
const r = require("rethinkdb");
let logger;

class RethinkBase extends EventEmitter {
  constructor(rethinkOptions) {
    super();
    if (!rethinkOptions || typeof rethinkOptions !== "object")
      throw new TypeError("No RethinkDB options object provided!");
    try {
      logger = require("../../logger/logger");
    } catch (err) {
      console.error(
        'Please install "logging" modules. Use this command to install: "npm i logging"'
      );
    }
    
    this.message = options.message;
    this.rethinkOptions = rethinkOptions;
    this.createConnection();
  }

  async createConnection() {
    try {
      this.connection = await r.connect(this.rethinkOptions);
      logger.info(this.message["success"]["connectionMessages"]["connect"].rethinkdb)
      this.emit("ready");
    } catch (error) {
      logger.error("RethinkDB Connection Error:", error);
      this.emit("error", error);
    }
  }

  async closeConnection() {
    if (this.connection && this.connection.open) {
      return this.connection.close().then(() => {
      });
    }
  }
}

module.exports = RethinkBase;
