var path = require('path');

module.exports = {
  entry: './src/connection.js',
  mode: 'development',
  output: {
    filename: 'connection.js',
    library: 'Connection',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    // https://github.com/webpack/webpack/issues/6525
    globalObject: 'this'
  },
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
}
