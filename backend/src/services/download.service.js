const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const PYTHON_PATH = path.resolve(
    __dirname,
    "../../venv/bin/python"
);

function normalizeUrl(url) {
    return url.replace(
        /https?:\/\/(www\.)?pornhub\.org/i,
        "https://www.pornhub.com"
    );
}

function downloadVideo(url, formatId, uniqueId) {
    const tempDir = path.join(__dirname, "../../temp");

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, {
            recursive: true
        });
    }

    const normalizedUrl = normalizeUrl(url);

    const outputTemplate = path.join(
        tempDir,
        `temp_${uniqueId}_%(title)s.%(ext)s`
    );

    const formatSpec = `${formatId}+bestaudio/best`;

    const args = [
        "-m",
        "yt_dlp",
        "-f",
        formatSpec,
        "--no-playlist",
        "--geo-bypass",
        "--js-runtimes",
        "node",
        "-o",
        outputTemplate,
        normalizedUrl
    ];

    console.log(
        "[yt-dlp] Download URL:",
        normalizedUrl
    );

    console.log(
        "[yt-dlp] Format:",
        formatSpec
    );

    const yt = spawn(PYTHON_PATH, args);

    let stderrOutput = "";

    const promise = new Promise((resolve, reject) => {
        yt.stderr.on("data", (data) => {
            stderrOutput += data.toString();
        });

        yt.on("error", (err) => {
            reject(
                new Error(
                    `Failed to start yt-dlp: ${err.message}`
                )
            );
        });

        yt.on("close", (code) => {
            if (code !== 0) {
                return reject(
                    new Error(
                        stderrOutput ||
                        `yt-dlp exited with code ${code}`
                    )
                );
            }

            try {
                const files = fs.readdirSync(tempDir);

                const matchingFile = files.find((file) =>
                    file.startsWith(
                        `temp_${uniqueId}_`
                    )
                );

                if (!matchingFile) {
                    return reject(
                        new Error(
                            "Downloaded file not found in temp directory"
                        )
                    );
                }

                const absolutePath = path.join(
                    tempDir,
                    matchingFile
                );

                resolve(absolutePath);
            } catch (err) {
                reject(err);
            }
        });
    });

    return {
        promise,

        cancel: () => {
            try {
                if (!yt.killed) {
                    yt.kill("SIGKILL");
                }
            } catch (err) {
                console.error(
                    "Failed to kill yt-dlp process:",
                    err
                );
            }
        }
    };
}

module.exports = {
    downloadVideo
};