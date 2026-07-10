const { spawn } = require("child_process");

function extractVideoInfo(url) {
    return new Promise((resolve, reject) => {
        const yt = spawn("yt-dlp", [
            "-J",
            "--no-playlist",
            "--geo-bypass",
            "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            url
        ]);

        let output = "";
        let error = "";

        yt.stdout.on("data", (data) => {
            output += data.toString();
        });

        yt.stderr.on("data", (data) => {
            error += data.toString();
        });

        yt.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(error || "yt-dlp failed"));
            }

            try {
                const json = JSON.parse(output);
                resolve(json);
            } catch (err) {
                reject(new Error("Failed to parse yt-dlp output"));
            }
        });
    });
}

module.exports = {
    extractVideoInfo
};
