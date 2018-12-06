const nodeExternals = require('webpack-node-externals');
const merge = require('webpack-merge');
const base = require('./webpack.base');

module.exports = merge(base, {
  mode: 'production',
  output: {
    libraryTarget: "commonjs"
  },
  externals: [nodeExternals()],
});
