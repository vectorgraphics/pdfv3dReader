const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    reader: "./src/reader.js",
    process: "./src/process.js",
  },
  output: {
    publicPath: "",
  },
};
