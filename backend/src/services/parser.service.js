const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff"];

function isExcludedFormat(format) {
    if (format.vcodec === "none") return true;
    if (!format.height) return true;

    const ext = (format.ext || "").toLowerCase();
    if (ext === "mhtml") return true;
    if (IMAGE_EXTENSIONS.includes(ext)) return true;

    const note = (format.format_note || "").toLowerCase();
    if (note.includes("storyboard")) return true;
    if (note.includes("thumbnail")) return true;

    return false;
}

function buildQualityEntry(format) {
    return {
        quality: format.height,
        formatId: format.format_id ?? null,
        ext: format.ext ?? null,
        filesize: format.filesize ?? format.filesize_approx ?? null,
    };
}

function buildQualities(formats) {
    const seen = new Map();

    for (const format of formats) {
        if (isExcludedFormat(format)) continue;

        const height = format.height;

        if (!seen.has(height)) {
            seen.set(height, buildQualityEntry(format));
        }
    }

    const qualities = Array.from(seen.values());
    qualities.sort((a, b) => a.quality - b.quality);

    return qualities;
}

function parseVideoInfo(info) {
    return {
        id: info.id ?? null,
        title: info.title ?? null,
        uploader: info.uploader ?? null,
        thumbnail: info.thumbnail ?? null,
        duration: info.duration ?? null,
        webpage_url: info.webpage_url ?? null,
        upload_date: info.upload_date ?? null,
        description: info.description ?? null,
        qualities: buildQualities(info.formats || []),
    };
}

module.exports = {
    parseVideoInfo,
};
