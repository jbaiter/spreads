/*eslint-disable*/
var path = require("path");
var webpack = require("webpack");

var __DEV__ = process.env.BUILD_DEV !== undefined;
var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(__DEV__),
  "process.env": {
    NODE_ENV: JSON.stringify(__DEV__ ? "development" : "production")
  }
});

var plugins= [];
if (!__DEV__) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        pure_getters: true,
        unsafe: true
      },
      mangle: true
    }));
    plugins.push(new webpack.optimize.DedupePlugin());
}
plugins.push(definePlugin);

var babelOpts = {
  optional: ["runtime"]
}

var babelJsxOpts = {
  optional: ["runtime", "optimisation.react.constantElements"]
}
if (!__DEV__) {
  babelJsxOpts.optional.push("optimisation.react.inlineElements");
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
      {test: require.resolve("react"), loader: "expose?React"},
      {
        test: /\.js$/,
        loaders: ["babel-loader?" + JSON.stringify(babelOpts), "eslint-loader"],
        exclude: /node_modules/
      },
      {
        test: /\.jsx$/,
        loaders: ["babel-loader?" + JSON.stringify(babelJsxOpts), "eslint-loader"],
        exclude: /node_modules/
      },
      {test: /\.jsx$/, loaders: ["babel-loader?" + JSON.stringify(babelJsxOpts)],
       exclude: /client\/src/},
      {test: /\.css$/, loader: "style!css"},
      {test: /\.scss$/, loader: "style!css!sass"},
      {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff"},
      {test: /\.(ttf|eot|svg|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader"}
    ],
    noParse: /\.min\.js/
  },
  resolve: {
    extensions: ["", ".js", ".json", ".jsx"],
    modulesDirectories: ["src", "node_modules"]
  },
  eslint: {
    emitWarning: true
  },
  plugins: plugins
}
