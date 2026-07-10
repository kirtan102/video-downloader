const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const metadataRoutes = require("./routes/metadata.route");
const { errorHandler } = require("./middlewares/error.middleware");

// Ensure temp directory exists
const tempDir = path.join(__dirname, "../temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/video", metadataRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend Running 🚀"
    });
});

app.use(errorHandler);

module.exports = app;
