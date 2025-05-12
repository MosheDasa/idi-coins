import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';
import * as dotenv from 'dotenv';

// Load environment variables
const env = dotenv.config().parsed || {};

// Create a string that will be replaced at build time
const envKeys = Object.keys(env).reduce((prev, next) => {
  if (next !== 'NODE_ENV') { // Skip NODE_ENV as it's handled by webpack mode
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
  }
  return prev;
}, {} as { [key: string]: string });

interface WebpackConfig extends Configuration {
  target?: string;
}

const mainConfig: WebpackConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    main: './src/main/electron.ts',
    preload: './src/main/preload.ts'
  },
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/main/index.html', to: 'index.html' },
        { from: 'src/main/splash.html', to: 'splash.html' },
        { from: 'src/main/about.html', to: 'about.html' }
      ],
    }),
    new DefinePlugin({
      ...envKeys,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],
  node: {
    __dirname: false,
    __filename: false
  }
};

const rendererConfig: WebpackConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/main/index.html')
    }),
    new DefinePlugin({
      ...envKeys,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]
};

export default [mainConfig, rendererConfig]; 