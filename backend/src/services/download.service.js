const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Downloads a video using yt-dlp and merges it with best audio if necessary.
 * Returns a promise that resolves to the final merged file's path.
 * Also returns a cancel function to terminate the download process early.
 */
function downloadVideo(url, formatId, uniqueId) {
    const tempDir = path.join(__dirname, "../../temp");
    
    // Ensure the temp directory exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Output template with unique prefix to identify the file later
    const outputTemplate = path.join(tempDir, `temp_${uniqueId}_%(title)s.%(ext)s`);

    // Use specific format with fallback to best audio if format is video-only
    const formatSpec = `${formatId}+bestaudio/best`;

    const args = [
        "-f", formatSpec,
        "--no-playlist",
        "--geo-bypass",
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "-o", outputTemplate,
        url
    ];

    const yt = spawn("yt-dlp", args);

    let stderrOutput = "";

    const promise = new Promise((resolve, reject) => {
        yt.stderr.on("data", (data) => {
            stderrOutput += data.toString();
        });

        yt.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(stderrOutput || `yt-dlp exited with code ${code}`));
            }

            // Find the finished file in the temp directory by looking for the uniqueId prefix
            try {
                const files = fs.readdirSync(tempDir);
                const matchingFile = files.find(file => file.startsWith(`temp_${uniqueId}_`));

                if (!matchingFile) {
                    return reject(new Error("Downloaded file not found in temp directory"));
                }

                const absolutePath = path.join(tempDir, matchingFile);
                resolve(absolutePath);
            } catch (err) {
                reject(err);
            }
        });

        yt.on("error", (err) => {
            reject(err);
        });
    });

    return {
        promise,
        cancel: () => {
            try {
                yt.kill("SIGKILL");
            } catch (err) {
                console.error("Failed to kill yt-dlp process:", err);
            }
        }
    };
}

module.exports = {
    downloadVideo
};
