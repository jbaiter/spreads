/*eslint-disable*/
var path = require("path");
var webpack = require("webpack");

var __DEV__ = process.env.BUILD_DEV !== undefined;
var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(__DEV__)
});

var plugins= [definePlugin];
if (!__DEV__) {
    plugins.push(new webpack.optimize.DedupePlugin());
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {warnings: false, drop_console: true}
    }));
}

module.exports = {
  cache: true,
  debug: __DEV__,
  devtool: __DEV__ ? "eval" : null,
  entry: "./src/app.js",
  output: {
    path: path.join(__dirname, "build"),
    filename: __DEV__ ? "bundle-dev.js" : "bundle.js",
    publicPath: "/static/"
  },
  module: {
    loaders: [
      {test: /\.js/, loaders: ["babel-loader", "eslint-loader"], exclude: /node_modules/},
      {test: /\.css$/, loader: "style!css"},
      {test: /\.scss$/, loader: "style!css!sass"},
      {test: /\.(ttf|svg|eot|woff|png|jpg)$/, loader: "file-loader"}
    ],
    noParse: /\.min\.js/
  },
  resolve: {
    extensions: ["", ".js", ".json", ".jsx"],
    modulesDirectories: ["node_modules", "src"]
  },
  eslint: {
    emitWarning: true
  },
  plugins: plugins
}
