const { logger } = require("../utils/logger");

exports.errorHandler = (err, req, res, next) => {
    logger.error(`Error processing ${req.method} ${req.url}: ${err.message}`);

    const message =
        typeof err === "string"
            ? err
            : err.message || "An unexpected error occurred";

    res.status(500).json({
        success: false,
        message,
    });
};
