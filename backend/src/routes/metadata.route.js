const express = require("express");
const { extractVideo } = require("../controllers/metadata.controller");
const { downloadVideoController } = require("../controllers/download.controller");
const { validateExtractRequest, validateDownloadRequest } = require("../validators/metadata.validator");

const router = express.Router();

router.post("/extract", validateExtractRequest, extractVideo);
router.get("/download", validateDownloadRequest, downloadVideoController);

module.exports = router;
