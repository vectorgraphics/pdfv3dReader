const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    reader: "./src/reader.js",
    process: "./src/process.js",
  },
  output: {
    publicPath: "",
  },
  optimization: {
    minimize: false,
  },
};
