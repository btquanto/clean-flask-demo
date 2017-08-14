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
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader'
            },
            {
                test: /\.svg$/,
                loader: 'svg-loader'
            },
         ]
     },
    resolve: {
        modules: ['./node_modules']
    },
     stats: {
         colors: true
     },
     devtool: 'source-map'
 };