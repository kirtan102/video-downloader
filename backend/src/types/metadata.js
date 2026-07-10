/**
 * @typedef {Object} Quality
 * @property {number} quality - The resolution height
 * @property {string|null} formatId - The yt-dlp format ID
 * @property {string|null} ext - File extension (e.g., 'mp4')
 * @property {number|null} filesize - File size in bytes
 */

/**
 * @typedef {Object} ParsedVideo
 * @property {string|null} id
 * @property {string|null} title
 * @property {string|null} uploader
 * @property {string|null} thumbnail
 * @property {number|null} duration
 * @property {string|null} webpage_url
 * @property {string|null} upload_date
 * @property {string|null} description
 * @property {Quality[]} qualities
 */

module.exports = {};
