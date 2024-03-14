// Base.js

const EventEmitter = require("events").EventEmitter;
const r = require("rethinkdb");

class RethinkBase extends EventEmitter {
    constructor(rethinkOptions) {
        super();
        if (!rethinkOptions || typeof rethinkOptions !== "object") throw new TypeError("No RethinkDB options object provided!");

        this.rethinkOptions = rethinkOptions;
        this.createConnection();
    }

    async createConnection() {
        try {
            this.connection = await r.connect(this.rethinkOptions);
            console.log("[ErenayDB] Successfully Connected to RethinkDB. Discord: https://discord.gg/WSvd3E6CNn");
            this.emit("ready");
        } catch (error) {
            console.error("[ErenayDB] RethinkDB Connection Error:", error);
            this.emit("error", error);
        }
    }

    async closeConnection() {
        if (this.connection && typeof this.connection.close === "function") {
            await this.connection.close();
            console.log("[ErenayDB] RethinkDB Connection Closed.");
        }
    }
}

module.exports = RethinkBase;
