const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
    allowedHosts: "all",
    historyApiFallback: true,
    hot: true,
    open: false,
  },
});
