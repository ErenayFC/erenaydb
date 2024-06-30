const EventEmitter = require("events").EventEmitter;
const mongoose = require("mongoose");
let logger;

class Base extends EventEmitter {
  /**
   * Instantiates the base database.
   * This class is implemented by the main Database class.
   * @param {String} mongoURL Mongodb Database URL.
   * @returns {Base}
   * @example const db = new Base("mongodb://localhost/mydb");
   */
  constructor(mongoURL, options = {}) {
    super();
    if (!mongoURL || !mongoURL.startsWith("mongodb"))
      throw new TypeError("No mongodb url was provided!");
    if (typeof mongoURL !== "string")
      throw new TypeError(
        `Expected a string for mongodbURL, received ${typeof mongoURL}`
      );
    if (typeof options !== "object")
      throw new TypeError(
        `Expected Object for options, received ${typeof options}`
      );
    try {
      logger = require("../../logger/logger");
    } catch (err) {
      console.error(
        'Please install "logging" modules. Use this command to install: "npm i logging"'
      );
    }
    this.mongoURI = mongoURL;

    this.message = options.message;

    this._create();

    mongoose.connection.on("error", (e) => {
      this.emit("error", e);
    });
    mongoose.connection.on("open", () => {
      logger.info(
        this.message["success"]["connectionMessages"]["connect"].mongodb
      );
      this.emit("ready");
    });
  }

  _create() {
    mongoose.connect(this.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  _destroyDatabase() {
    mongoose.disconnect();
    this.readyAt = undefined;
  }
}

module.exports = Base;
