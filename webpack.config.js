 var path = require('path');
 var webpack = require('webpack');

 module.exports = {
     entry: {
         elastic: './application/blueprints/elastic/static/js/elastic.js'
     },
     output: {
         path: path.resolve(__dirname, 'application/static/js'),
         filename: '[name].bundle.js'
     },
     module: {
         loaders: [
             {
                 test: /\.js$/,
                 loader: 'babel-loader',
                 query: {
                     presets: ['es2015']
                 }
             }
         ]
     },
     stats: {
         colors: true
     },
     devtool: 'source-map'
 };