const { spawn } = require("child_process");
const path = require("path");

const PYTHON_PATH = path.resolve(__dirname, "../../venv/bin/python");

function extractVideoInfo(url) {
    return new Promise((resolve, reject) => {
        const args = [
            "-m",
            "yt_dlp",
            "-J",
            "--no-playlist",
            "--geo-bypass",
            url,
        ];

        const yt = spawn(PYTHON_PATH, args);

        let output = "";
        let error = "";

        yt.stdout.on("data", (data) => {
            output += data.toString();
        });

        yt.stderr.on("data", (data) => {
            error += data.toString();
        });

        yt.on("error", (err) => {
            reject(
                new Error(`Failed to start yt-dlp: ${err.message}`)
            );
        });

        yt.on("close", (code) => {
            if (code !== 0) {
                return reject(
                    new Error(error.trim() || "yt-dlp failed")
                );
            }

            try {
                const videoInfo = JSON.parse(output);
                resolve(videoInfo);
            } catch {
                reject(
                    new Error("Failed to parse yt-dlp output")
                );
            }
        });
    });
}

module.exports = {
    extractVideoInfo,
};