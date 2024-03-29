const EventEmitter = require("events").EventEmitter;
const mongoose = require("mongoose");

class Base extends EventEmitter {

    /**
     * Instantiates the base database.
     * This class is implemented by the main Database class.
     * @param {String} mongoURL Mongodb Database URL.
     * @returns {Base}
     * @example const db = new Base("mongodb://localhost/mydb");
     */
    constructor(mongoURL, connectionOptions={}) {
        super();
        if (!mongoURL || !mongoURL.startsWith("mongodb")) throw new TypeError("No mongodb url was provided!");
        if (typeof mongoURL !== "string") throw new TypeError(`Expected a string for mongodbURL, received ${typeof mongoURL}`);
        if (typeof connectionOptions !== "object") throw new TypeError(`Expected Object for connectionOptions, received ${typeof connectionOptions}`);

        this.mongoURI = mongoURL;

        this.options = connectionOptions;

        this._create();

        mongoose.connection.on("error", (e) => {
            this.emit("error", e);
        });
        mongoose.connection.on("open", () => {
            console.log("[ErenayDB] MongoDB Was Successfully Connected. Discord: https://discord.gg/WSvd3E6CNn")
            this.emit("ready");
        });
    }


    _create() {
        mongoose.connect(this.mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    _destroyDatabase() {
        mongoose.disconnect();
        this.readyAt = undefined;
    }
}

module.exports = Base;
