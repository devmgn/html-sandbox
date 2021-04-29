/**
 * Webpack configuration
 * @see https://webpack.js.org
 */

/** @typedef { import('webpack').Configuration } WebpackConfiguration */

const glob = require('glob');
const path = require('path');
const sass = require('sass');
const fibers = require('fibers');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminOptipng = require('imagemin-optipng');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminWebp = require('imagemin-webp');
const imageminSvgo = require('imagemin-svgo');
const svgo = require('svgo');

// webpack plugins
const TerserWebpackPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
// @ts-ignore
// TODO: fix types
const WebpackFixStyleOnlyEntries = require('webpack-fix-style-only-entries');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// configurations
const { directory, javascriptPattern, resourcesRegExp, targetsPatternToCopy, placeholders } = require('./config');

/** @returns { WebpackConfiguration } */
module.exports = () => {
  const isProductionBuild = process.env.NODE_ENV === 'production';

  const getMultipleEntry = () => {
    return glob
      .sync(`**/@(?(*.)bundle.${javascriptPattern}|[^_]*.scss)`, { cwd: directory.src })
      .reduce((entry, src) => {
        const name = path.format({
          dir: path.dirname(src),
          name: path.parse(src).name,
        });

        return Object.assign(entry, { [name]: path.resolve(directory.src, src) });
      }, {});
  };

  const sourceMap = {
    sourceMap: !isProductionBuild,
  };

  const assetModuleOptions = {
    type: 'asset',
    parser: {
      dataUrlCondition: {
        maxSize: 1024 / 4,
      },
    },
  };

  return {
    mode: isProductionBuild ? 'production' : 'development',
    entry: getMultipleEntry(),
    output: {
      path: path.resolve(directory.dist),
      filename: `${placeholders}.js`,
      publicPath: isProductionBuild ? directory.publicPath : '/',
      assetModuleFilename: (pathData) => {
        return pathData.filename
          ? path.join(path.relative(directory.src, path.dirname(pathData.filename)), `${placeholders}[ext]`)
          : '';
      },
    },
    module: {
      rules: [
        // JavaScript
        {
          test: /\.[jt]sx?$/i,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        },
        // Sass
        {
          test: /\.scss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { ...sourceMap },
            },
            {
              loader: 'postcss-loader',
              options: { ...sourceMap },
            },
            {
              loader: 'sass-loader',
              options: {
                ...sourceMap,
                implementation: sass,
                sassOptions: {
                  fiber: fibers,
                },
              },
            },
          ],
        },
        // Pug
        {
          test: /\.pug$/i,
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: true,
                root: path.resolve(directory.src),
              },
            },
          ],
        },
        // Assets
        {
          test: resourcesRegExp,
          type: 'asset/resource',
        },
        // Bitmap images
        ...[/\.jpe?g$/i, /\.png$/i, /\.gif$/i, /\.webp$/i].map((regExp, index) => {
          const plugins = [imageminJpegtran(), imageminOptipng(), imageminGifsicle(), imageminWebp()];
          return {
            test: regExp,
            ...assetModuleOptions,
            use: [
              {
                loader: 'img-loader',
                options: {
                  plugins: [plugins[index]],
                },
              },
            ],
          };
        }),
        // svg
        {
          test: /\.svg$/i,
          use: [
            {
              loader: 'img-loader',
              options: {
                plugins: [
                  imageminSvgo({
                    /** @type { any } */
                    plugins: svgo.extendDefaultPlugins([
                      { name: 'removeViewBox', active: false },
                      { name: 'removeDimensions', active: true },
                      { name: 'removeAttrs', active: true, params: { attrs: ['data.*'] } },
                    ]),
                  }),
                ],
              },
            },
          ],
          oneOf: [
            // inline svg
            {
              resourceQuery: /inline/,
              type: 'asset/source',
            },
            // default
            {
              ...assetModuleOptions,
            },
          ],
        },
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(directory.src, directory.javascript),
      },
      modules: ['node_modules', directory.src],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    optimization: {
      chunkIds: isProductionBuild ? 'total-size' : 'named',
      splitChunks: {
        cacheGroups: {
          defaultVendors: {
            chunks: 'initial',
            minChunks: 2,
            name: path.join(directory.javascript, 'vendor'),
            enforce: true,
          },
        },
      },
      minimize: true,
      minimizer: [
        new TerserWebpackPlugin({
          extractComments: false,
        }),
        new CssMinimizerWebpackPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                calc: false,
                reduceInitial: false,
              },
            ],
          },
        }),
      ],
    },
    plugins: [
      ...glob
        .sync('**/[!_]*.pug', {
          cwd: directory.src,
        })
        .map((src) => {
          return new HtmlWebpackPlugin({
            template: path.join(directory.src, src),
            filename: path.format({
              dir: path.dirname(src),
              name: path.parse(src).name,
              ext: '.html',
            }),
            inject: false,
            minify: {
              // HTMLMinifier
              // @see https://github.com/DanielRuf/html-minifier-terser#options-quick-reference
              removeStyleLinkTypeAttributes: true,
              removeScriptTypeAttributes: true,
              collapseBooleanAttributes: true,
              collapseWhitespace: isProductionBuild,
            },
            isProduction: isProductionBuild,
          });
        }),
      new MiniCssExtractPlugin({
        filename: `${placeholders}.css`,
      }),
      new WebpackFixStyleOnlyEntries({
        silent: !isProductionBuild,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: targetsPatternToCopy,
            to: '[path][name][ext]',
            context: directory.src,
            noErrorOnMissing: true,
          },
        ],
      }),
      new CleanWebpackPlugin(),
      new FriendlyErrorsWebpackPlugin(),
    ],
    devtool: !isProductionBuild && 'inline-source-map',
    cache: {
      type: 'filesystem',
    },
  };
};
