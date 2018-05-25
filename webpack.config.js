var path = require("path");

module.exports = {
  mode: "production",
  entry: "./lib/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "filterous.js",
    library: "filterous",
    libraryTarget: "umd",
  },
  externals: ["fs", "canvas", "debug"],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    }],
  },
};
