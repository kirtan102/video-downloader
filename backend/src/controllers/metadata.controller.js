const { extractVideoInfo } = require("../services/ytdlp.service");
const { parseVideoInfo } = require("../services/parser.service");

exports.extractVideo = async (req, res, next) => {
    try {
        const { url } = req.body;
        const rawInfo = await extractVideoInfo(url);
        const video = parseVideoInfo(rawInfo);

        return res.json({
            success: true,
            data: video,
        });
    } catch (err) {
        next(err); // Pass error to centralized error middleware
    }
};
