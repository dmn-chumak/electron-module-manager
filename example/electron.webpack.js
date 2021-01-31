const Path = require('path');

//-----------------------------------

const commonConfig = {
    devtool: 'cheap-module-source-map',
    mode: 'development',
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.jsx' ]
    },
    watchOptions: {
        ignored: /node_modules/
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    'ts-loader'
                ]
            }
        ]
    }
};

//-----------------------------------

module.exports = [
    {
        ...commonConfig,
        entry: './source/application.ts',
        target: 'electron-main',
        output: {
            filename: 'application.js',
            path: Path.resolve(
                __dirname, 'output'
            )
        },
        node: {
            __filename: true,
            __dirname: true
        }
    },
    {
        ...commonConfig,
        entry: './source/window.ts',
        target: 'electron-renderer',
        output: {
            filename: 'window.js',
            path: Path.resolve(
                __dirname, 'output'
            )
        }
    },
    {
        ...commonConfig,
        entry: './source/window.bridge.ts',
        target: 'electron-main',
        devtool: false,
        mode: 'production',
        output: {
            filename: 'window.bridge.js',
            path: Path.resolve(
                __dirname, 'output'
            )
        },
        node: {
            __filename: true,
            __dirname: true
        }
    }
];
