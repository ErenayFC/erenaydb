const EventEmitter = require("events").EventEmitter;
const mysql = require("mysql2");
let logger;

class MySQLBase extends EventEmitter {
  constructor(options) {
    super();
    if (!options.mysqlOptions || typeof options.mysqlOptions !== "object")
      throw new TypeError("No MySQL options object provided!");
    try {
      logger = require("../../logger/logger");
    } catch (err) {
      console.error(
        'Please install "logging" modules. Use this command to install: "npm i logging"'
      );
    }
    this.message = options.message;
    this.mysqlOptions = options.mysqlOptions;
    this.createConnection();
  }

  createConnection() {
    try {
      this.connection = mysql.createConnection(this.mysqlOptions);
      this.connection.connect((error) => {
        if (error) {
          logger.error("MySQL Connection Error:", error);
          //this.emit("error", error);
        } else {
          logger.info(this.message["success"]["connectionMessages"]["connect"].mysql);
          this.emit("ready");
        }
      });
    } catch (error) {
      logger.error("MySQL Connection Error:", error);
      //this.emit("error", error);
    }
  }
  async closeConnection() {
    if (this.connection) {
      return this.connection.end((err) => {
        if (err) {
          logger.error("Error closing MySQL connection:", err);
        } else {
          logger.info(this.message["success"]["connectionMessages"]["disconnect"].mysql);
        }
      });
    }
  }
}

module.exports = MySQLBase;
