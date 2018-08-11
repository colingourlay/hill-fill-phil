const humanFormat = require('human-format');
const { fontFamily, fontSizes, fontWeight } = require('./constants');

const humanFormatScale = new humanFormat.Scale({
  b: 1,
  k: 1024,
  M: 1024 * 1024,
  G: 1024 * 1024 * 1024,
  T: 1024 * 1024 * 1024 * 1024
});

module.exports.fileSize = bytes => humanFormat(bytes, { scale: humanFormatScale });

module.exports.font = fontSize => `${fontWeight} ${fontSizes[fontSize || 2]}px ${fontFamily}`;
