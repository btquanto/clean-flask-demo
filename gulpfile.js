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
const wpStream = require('webpack-stream');
const webpack = require('webpack');

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
                ...(process.env.NODE_ENV === 'production'
                    ? [pipes.splice(pipes.length - 2, 0, minifyCSS())]
                    : []),
                gulp.dest(destination)
            ];

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

            let wpConfig = {
                plugins: [
                    new webpack.DefinePlugin({
                        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
                    }),
                    ...(process.env.NODE_ENV === 'production' ? [new webpack.optimize.UglifyJsPlugin()] : [])
                ],
                module: {
                    loaders: [{
                        test: /\.(js|jsx)$/,
                        loader: 'babel-loader',
                        exclude: /node_modules/,
                        query: {
                            presets: ['es2015', 'react', 'stage-0'],
                            compact: false,
                            plugins: ["transform-object-rest-spread"],
                            cacheDirectory: true,
                        },
                    }]
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
            };

            let pipes = [
                gulp.src(sources),
                named(),
                wpStream(wpConfig, webpack),
                rename({
                    suffix: '.min'
                }),
                gulp.dest(destination)
            ];

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
        './components/js/*.js'
    ];

    let components_scss_sources = [
        './components/scss/*.scss'
    ];

    gulp.watch(components_sources, ['compile_js'])
    gulp.watch(components_scss_sources, ['compile_scss'])
}

gulp.task('compile_scss', compileSCSS);

gulp.task('compile_js', compileJS);

gulp.task("build", ['compile_scss', 'compile_js']);

gulp.task("watch", watch);

gulp.task('default', ['build', 'watch']);