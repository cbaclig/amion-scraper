var path = require("path");

module.exports = {
  entry: {
    index: "./lambda/index.js"
  },
  output: {
     path: path.join(__dirname, "dist"),
     library: "[name]",
     libraryTarget: "commonjs2",
     filename: "[name].js"
  },
  target: "node",
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
