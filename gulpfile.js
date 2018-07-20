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

const SOURCES = ['app']

const BUILD_FOLDER = 'assets'

function build_global_assets() {
    ['css', 'images', 'js'].map(item => {
        let source = `./frontend/global/${item}/*`
        let destination = `${BUILD_FOLDER}/global/${item}`
        let pipes = [
            gulp.src(source),
            ...(process.env.NODE_ENV === 'production' && item === 'css'? [minifyCSS()] : []),
            gulp.dest(destination)
        ]
        pump(pipes)
    })
}

function build_scss() {
    SOURCES.map(endpoint => {
        let sources = [`frontend/${endpoint}/scss/${endpoint}.scss`]
        let destination = `${BUILD_FOLDER}/${endpoint}/css/`
        let pipes = [
            gulp.src(sources),
            sass({
                includePaths: [
                    './frontend/components/scss',
                    './frontend/global/scss',
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
}

function build_js() {
    SOURCES.map(endpoint => {
        let source = `frontend/${endpoint}/js/index.js`
        let destination = `${BUILD_FOLDER}/${endpoint}/js/`
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
                    Components: path.resolve(__dirname, "frontend/components/js"),
                    Global: path.resolve(__dirname, "frontend/global/js")
                }
            },
            stats: {
                colors: true
            }
        }

        let pipes = [
            gulp.src(source),
            named(),
            wpStream(webpackConfig, webpack),
            rename({
                suffix: '.min'
            }),
            gulp.dest(destination)
        ]
        pump(pipes)
    })
}

function watch() {

    gulp.watch([
        './frontend/global/css/*',
        './frontend/global/images/*',
    ], ['build_global_assets'])

    SOURCES.map(endpoint => {
        gulp.watch([
            `./frontend/${endpoint}/scss/*.scss`
        ], ['build_scss'])

        gulp.watch([
            `./frontend/${endpoint}/js/*.js`,
        ], ['build_js'])
    })

    gulp.watch([
        './frontend/components/js/*.js',
        './frontend/global/js/*.js'
    ], ['build_js'])

    gulp.watch([
        './frontend/components/scss/*.scss',
        './frontend/global/scss/*.scss'
    ], ['build_scss'])
}

gulp.task('build_global_assets', build_global_assets)
gulp.task('build_scss', build_scss)
gulp.task('build_js', build_js)
gulp.task('build', ['build_global_assets', 'build_scss', 'build_js'])
gulp.task('watch', watch)
gulp.task('default', ['build', 'watch'])