import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = JSON.stringify(process.env.API_URL || 'https://api.genderize.io');

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
        { from: 'src/main/splash.html', to: 'splash.html' }
      ],
    }),
    new DefinePlugin({
      'process.env.API_URL': API_URL
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
      'process.env.API_URL': API_URL
    })
  ]
};

export default [mainConfig, rendererConfig]; 