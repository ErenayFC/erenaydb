const { default: createLogger } = require("logging");

 const logger = createLogger("ErenayDB");

module.exports = {
    info: logger.info,
    warn: logger.warn,
    error: logger.error,
    debug: logger.debug
};