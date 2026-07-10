const path = require("path");
const fs = require("fs");
const { downloadVideo } = require("../services/download.service");
const { logger } = require("../utils/logger");

exports.downloadVideoController = async (req, res, next) => {
    const { url, formatId } = req.query;
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    logger.info(`Starting download for URL: ${url}, Format: ${formatId}, ID: ${uniqueId}`);

    const { promise, cancel } = downloadVideo(url, formatId, uniqueId);
    let downloadedFilePath = null;
    let isClientDisconnected = false;

    // Listen for client disconnect/abort
    req.on("close", () => {
        isClientDisconnected = true;
        logger.warn(`Client disconnected during download for ID: ${uniqueId}. Cleaning up...`);
        cancel();
        
        // Try deleting the file if it was created
        if (downloadedFilePath && fs.existsSync(downloadedFilePath)) {
            try {
                fs.unlinkSync(downloadedFilePath);
                logger.info(`Deleted temp file after client disconnect: ${downloadedFilePath}`);
            } catch (err) {
                logger.error(`Error deleting temp file after disconnect: ${err.message}`);
            }
        }
    });

    try {
        downloadedFilePath = await promise;

        if (isClientDisconnected) {
            // If client already closed connection while we were completing, delete file and exit
            if (fs.existsSync(downloadedFilePath)) {
                fs.unlinkSync(downloadedFilePath);
            }
            return;
        }

        const originalName = path.basename(downloadedFilePath);
        
        // Strip the unique temp prefix for the client (temp_<uniqueId>_filename -> filename)
        const cleanName = originalName.replace(/^temp_[^_]+_[^_]+_/, "") || originalName;

        logger.info(`Download completed. Streaming file ${cleanName} to client...`);

        res.download(downloadedFilePath, cleanName, (err) => {
            // Cleanup file after download starts/completes
            try {
                if (fs.existsSync(downloadedFilePath)) {
                    fs.unlinkSync(downloadedFilePath);
                    logger.info(`Successfully deleted temp file: ${downloadedFilePath}`);
                }
            } catch (cleanupErr) {
                logger.error(`Failed to delete temp file ${downloadedFilePath}: ${cleanupErr.message}`);
            }

            if (err && !res.headersSent) {
                logger.error(`Error streaming download: ${err.message}`);
                return next(err);
            }
        });
    } catch (err) {
        logger.error(`Download failed for ID ${uniqueId}: ${err.message}`);
        
        // Cleanup partial files if any exist
        if (downloadedFilePath && fs.existsSync(downloadedFilePath)) {
            try {
                fs.unlinkSync(downloadedFilePath);
            } catch (e) {}
        }

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: err.message || "Failed to download video",
            });
        }
    }
};
