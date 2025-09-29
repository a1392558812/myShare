const { compressJsonInDirectory } = require("./json-compressor.js");
const path = require("path");

compressJsonInDirectory(path.join(__dirname), 0);
