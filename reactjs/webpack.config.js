var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, '../public/js');
var APP_DIR = path.resolve(__dirname, 'src/app');

var config = {
    entry: {
        meetup: APP_DIR + '/meetup.jsx'
    },
    output: {
        path: BUILD_DIR,
        filename: "[name].bundle.js"
    },
    module : {
        loaders : [
            {
                test : /\.jsx?/,
                include : APP_DIR,
                loader : 'babel-loader'
            },
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    }
};

module.exports = config;
