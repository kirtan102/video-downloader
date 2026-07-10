exports.validateExtractRequest = (req, res, next) => {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
        return res.status(400).json({
            success: false,
            message: "URL is required and must be a string",
        });
    }

    try {
        new URL(url);
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Invalid URL format",
        });
    }

    next();
};

exports.validateDownloadRequest = (req, res, next) => {
    const { url, formatId } = req.query;

    if (!url || typeof url !== "string") {
        return res.status(400).json({
            success: false,
            message: "URL query parameter is required and must be a string",
        });
    }

    if (!formatId || typeof formatId !== "string") {
        return res.status(400).json({
            success: false,
            message: "formatId query parameter is required and must be a string",
        });
    }

    try {
        new URL(url);
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Invalid URL format",
        });
    }

    next();
};
