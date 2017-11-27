'use strict';

// dependencies
var babel = require('gulp-babel');
var gulp = require('gulp');
var minifyCSS = require('gulp-clean-css');
var named = require('vinyl-named');
var path = require('path');
var pump = require('pump');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var webpack = require('gulp-webpack');
var argv = require('yargs').argv;

var SOURCES = [
    "home",
    "rtc"
]

// var JS_SOURCES = {
//     "home": [
//         "register",
//         "reduxrtc",
//         "webrtc"
//     ],
//     "rtc": []
// }

var BUILD_FOLDER = 'static/assets';

var isProduction = (argv.production === undefined) ? false : true;

function compileSCSS() {
    SOURCES.map(
        function (blueprint) {
            let source = `./app/blueprints/${blueprint}/static/${blueprint}/scss/*.scss`
            let destination = `${BUILD_FOLDER}/${blueprint}/css/`;

            let pipes = [
                gulp.src(source),
                sass({
                    includePaths: [
                        './components/scss',
                        './node_modules'
                    ]
                }).on('error', sass.logError),
                rename({
                    suffix: '.min'
                }),
                gulp.dest(destination)
            ];

            if (isProduction) {
                pipes.splice(pipes.length - 2, 0, minifyCSS());
            }

            return pump(pipes);
        }
    );
}

function compileJS() {
    SOURCES.map(function (blueprint) {

        let sources = [
            `./app/blueprints/${blueprint}/static/${blueprint}/js/*.js`,
            `./app/blueprints/${blueprint}/static/${blueprint}/js/*.jsx`
        ]
        let destination = `${BUILD_FOLDER}/${blueprint}/js/`;

        let pipes = [
            gulp.src(sources),
            named(),
            webpack({
                module: {
                    loaders: [{
                        test: /\.(js|jsx)$/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['es2015', 'react', 'stage-3'],
                            compact: false,
                            plugins: ["transform-object-rest-spread"],
                            cacheDirectory: true
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
                    }
                    ]
                },
                resolve: {
                    modules: ['./node_modules'],
                    alias: {
                        Components: path.resolve(__dirname, "components/js")
                    }
                },
                stats: {
                    colors: true
                }
            }),
            rename({
                suffix: '.min'
            }),
            gulp.dest(destination)
        ];

        if (isProduction) {
            pipes.splice(pipes.length - 2, 0, uglify());
        }

        return pump(pipes);
    });
}

function watch() {
    SOURCES.map(
        function (blueprint) {
            let source = `./app/blueprints/${blueprint}/static/${blueprint}/scss/*.scss`
            let destination = `${BUILD_FOLDER}/${blueprint}/css/`;
            return gulp.watch(source, ['compile_scss'])
        }
    );
    SOURCES.map(function (blueprint) {
        let sources = [
            './components/js/*.js',
            './components/js/*.jsx',
            `./app/blueprints/${blueprint}/static/${blueprint}/js/*.js`,
            `./app/blueprints/${blueprint}/static/${blueprint}/js/*.jsx`
        ]
        return gulp.watch(sources, ['compile_js'])
    });
}

gulp.task('compile_scss', compileSCSS);

gulp.task('compile_js', compileJS);

gulp.task("build", ['compile_scss', 'compile_js']);

gulp.task("watch", watch);

gulp.task('default', ['build', 'watch']);