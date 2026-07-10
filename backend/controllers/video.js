const { extractVideoInfo } = require("../services/ytdlp");
const { parseVideoInfo } = require("../services/parser");

exports.extractVideo = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "URL is required",
            });
        }

        const rawInfo = await extractVideoInfo(url);
        const video = parseVideoInfo(rawInfo);

        return res.json({
            success: true,
            data: video,
        });
    } catch (err) {
        const message =
            typeof err === "string"
                ? err
                : err.message || "An unexpected error occurred";

        return res.status(500).json({
            success: false,
            message,
        });
    }
};
