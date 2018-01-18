'use strict';

// dependencies
const babel = require('gulp-babel');
const gulp = require('gulp');
const minifyCSS = require('gulp-clean-css');
const named = require('vinyl-named');
const path = require('path');
const pump = require('pump');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const webpack = require('gulp-webpack');
const argv = require('yargs').argv;

const SCSS_SOURCES = [
    'home',
    'rtc'
]

const JS_SOURCES = {
    'home': [
        'home',
    ],
    'rtc': [
        'rtc'
    ]
}

const BUILD_FOLDER = 'static/assets';

const isProduction = (argv.production === undefined) ? false : true;

function compileSCSS() {
    SCSS_SOURCES.map(
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

    Object.keys(JS_SOURCES).map(blueprint => {
        JS_SOURCES[blueprint].map(endpoint => {
            let sources = [
                `./app/blueprints/${blueprint}/static/${blueprint}/js/${endpoint}.js`,
                `./app/blueprints/${blueprint}/static/${blueprint}/js/${endpoint}.jsx`
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

            pump(pipes);
        })
    });
}

function watch() {
    SCSS_SOURCES.map(
        function (blueprint) {
            let source = `./app/blueprints/${blueprint}/static/${blueprint}/scss/*.scss`
            let destination = `${BUILD_FOLDER}/${blueprint}/css/`;
            gulp.watch(source, ['compile_scss'])
        }
    );

    Object.keys(JS_SOURCES).map(function (blueprint) {
        let sources = [
            `./app/blueprints/${blueprint}/static/${blueprint}/js/*.js`,
        ]
        gulp.watch(sources, ['compile_js'])
    });

    let components_sources = [
        './components/js/*.js',
        './components/js/*.jsx',
    ];

    gulp.watch(components_sources, ['compile_js'])
}

gulp.task('compile_scss', compileSCSS);

gulp.task('compile_js', compileJS);

gulp.task("build", ['compile_scss', 'compile_js']);

gulp.task("watch", watch);

gulp.task('default', ['build', 'watch']);