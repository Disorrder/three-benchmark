'use strict';
const os = require('os');
const path = require('path');
const webpack = require('webpack');

var cfg = require('./buildconfig.json');
const npm = require('./package.json');
const bower = require('./bower.json');
const pug = require('pug');

const WebpackNotifierPlugin = require('webpack-notifier');
const CleanWebpackPlugin  = require('clean-webpack-plugin');
const CopyWebpackPlugin   = require('copy-webpack-plugin');
const HtmlWebpackPlugin   = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const SplitByPathPlugin = require('webpack-split-by-path');

// env variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
function isDev() { return process.env.NODE_ENV == 'development' }
function isProd() { return process.env.NODE_ENV == 'production' }
function isMac() { return os.platform() == 'darwin' }
function isWin() { return os.platform() == 'win32' }

var flags = {
    watch: false,
    // watch: isDev(),
    clean: isProd(),
    sourcemaps: isDev() && !isMac(),
    notify: isDev(),
}

console.log('Builder is running in', process.env.NODE_ENV, 'mode.');
// console.log('Flags:', flags);

module.exports = {
    context: path.resolve(cfg.path.app),
    watch: flags.watch,
    entry: {
        app: `app/app.entry.js`,
    },
    output: {
        path: path.resolve(__dirname, cfg.path.build),
        // publicPath: cfg.path.build,
        filename: '[name].js',
        library: '[name]'
    },
    devtool: flags.sourcemaps ? "cheap-source-map" : false,
    devServer: {
        port: cfg.webserver.port,
        host: cfg.webserver.host,
        inline: true,
        disableHostCheck: true,
        historyApiFallback: true,
        contentBase: cfg.path.src,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
        stats: 'minimal',
    },
    resolve: {
        modules: [
            path.join(__dirname, "src"),
            "node_modules"
        ],
        // Tell webpack to look for required files in bower and node
        // modulesDirectories: ['../bower_components', '../node_modules'],
        // extensions: ['', '.js', '.coffee', '.json']
        alias: {
            vue: 'vue/dist/vue.js'
        }
    },
    // resolveLoader: {
    //     root: path.resolve('./node_modules'),
    //     // modulesDirectories: ['node_modules'],
    //     extensions: ['', '.js']
    // },
    module: {
        rules: [
            { test: /\.js$/, loader: "babel-loader", exclude: [/node_modules/, /bower_components/], query: { presets: ['es2015', 'stage-2'] } },
            // { test: /\.coffee$/, loader: "coffee-loader" },
            { test: /\.(pug|jade)$/, loader: "pug-loader" },
            { test: /\.css$/, use: ["style-loader", "css-loader"] },
            { test: /\.styl$/, use: ["style-loader", "css-loader", "stylus-loader"] },
            { test: /\.font\.(js|json)$/, use: ["style-loader", "css-loader", "fontgen-loader"] },
            {
                test: /\.(jpeg|jpg|png|gif|woff|svg|ttf|eot)$/i,
                loader: "file-loader",
                options: {
                    name: "/[path][name].[ext]"
                }
            },
            // { test: /scene\.json$/, loader: "file-loader", options: {name: "[path][name].[ext]"} },
            { test: /\.glsl$/, loader: "webpack-glsl-loader" }
        ],
        noParse: /\.min\.js$/
    },
    plugins: [
        flags.notify ? new WebpackNotifierPlugin({excludeWarnings: true}) : new Function(),
        flags.clean ? new CleanWebpackPlugin([cfg.path.build]) : new Function(),
        new OpenBrowserPlugin({ url: `http://${cfg.webserver.hostname}:${cfg.webserver.port}` }),

        new webpack.LoaderOptionsPlugin({
            debug: true
        }),

        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.pug',
            inject: 'head'
        }),

        // new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
        // new webpack.ResolverPlugin(
        //     new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
        // ),

        new webpack.DefinePlugin({
            'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),

        new CopyWebpackPlugin([
            { from: 'config.js' },
            { from: 'favicon.*' },
            { from: 'assets/', to: 'assets/' },
        ]),

        new SplitByPathPlugin([
            {
                name: 'vendor',
                path: [
                    path.resolve('./node_modules'),
                    path.resolve('./bower_components')
                ]
            }
        ]),

        new webpack.ProvidePlugin({
           $: 'jquery',
           jQuery: 'jquery',
           _: 'lodash',
        })
    ]
}

if (cfg.api && cfg.api.active) {
    if (!module.exports.devServer.proxy) module.exports.devServer.proxy = {};
    Object.assign(module.exports.devServer.proxy, {
        '/api/**': { target: `http://${cfg.api.host}:${cfg.api.port}`, secure: false }
    });
}
