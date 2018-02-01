'use strict'

const babel = require('gulp-babel')
const gulp = require('gulp')
const minifyCSS = require('gulp-clean-css')
const named = require('vinyl-named')
const path = require('path')
const pump = require('pump')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const wpStream = require('webpack-stream')
const webpack = require('webpack')

const SOURCES = {
    'admin': [
        'admin'
    ],
    'home': [
        'home'
    ],
    'rtc': [
        'rtc'
    ]
}

const BUILD_FOLDER = 'static/assets'

function compile_scss() {

    Object.keys(SOURCES).map(blueprint => {
        SOURCES[blueprint].map(endpoint => {
            let source = `./app/blueprints/${blueprint}/static/${blueprint}/scss/${endpoint}.scss`
            let destination = `${BUILD_FOLDER}/${blueprint}/css/`

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
                ...(process.env.NODE_ENV === 'production' ? [minifyCSS()] : []),
                gulp.dest(destination)
            ]

            pump(pipes)
        })
    })
}

function compile_js() {
    Object.keys(SOURCES).map(blueprint => {
        SOURCES[blueprint].map(endpoint => {
            let sources = [
                `./app/blueprints/${blueprint}/static/${blueprint}/js/${endpoint}.js`
            ]

            let destination = `${BUILD_FOLDER}/${blueprint}/js/`

            let webpackConfig = {
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
                            presets: ['env', 'react'],
                            compact: false,
                            plugins: [
                                "transform-class-properties",
                                "transform-object-rest-spread"
                            ],
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
            }

            let pipes = [
                gulp.src(sources),
                named(),
                wpStream(webpackConfig, webpack),
                rename({
                    suffix: '.min'
                }),
                gulp.dest(destination)
            ]

            pump(pipes)
        })
    })
}

function watch() {
    Object.keys(SOURCES).map(blueprint => {
        gulp.watch([
            `./app/blueprints/${blueprint}/static/${blueprint}/scss/*.scss`
        ], ['compile_scss'])

        gulp.watch([
            `./app/blueprints/${blueprint}/static/${blueprint}/js/*.js`,
        ], ['compile_js'])
    })

    gulp.watch([
        './components/js/*.js'
    ], ['compile_js'])

    gulp.watch([
        './components/scss/*.scss'
    ], ['compile_scss'])
}

gulp.task('compile_scss', compile_scss)
gulp.task('compile_js', compile_js)
gulp.task("build", ['compile_scss', 'compile_js'])
gulp.task("watch", watch)
gulp.task('default', ['build', 'watch'])