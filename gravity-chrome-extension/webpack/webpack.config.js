const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
    mode: "production",
    entry: {
        background: path.resolve(__dirname, "..", "src", "background.ts"),
        content: path.resolve(__dirname, "..", "src", "contentScript.ts"),
        devtools: path.resolve(__dirname, "..", "src", "devtools", "devtools.ts"),
        panel: path.resolve(__dirname, "..", "src", "devtools", "panel", "panel.tsx"),
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: ".", context: "public" }]
        }),
        new HtmlWebpackPlugin({
            template: "./src/devtools/devtools.html",
            filename: "devtools.html",
            chunks: ['devtools'],
            cache: false,
        }),
        new HtmlWebpackPlugin({
            template: "./src/devtools/panel/panel.html",
            filename: "panel.html",
            chunks: ['panel'],
            cache: false,
        }),
    ],
};