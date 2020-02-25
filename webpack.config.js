/**
 * Webpack configuration
 * https://webpack.js.org
 */

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const glob = require('glob')
const path = require('path')
const ip = require('ip').address
const nodeSassGlobImporter = require('node-sass-glob-importer')

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default

const { directory, fileExtension } = require('./config')
const ENV = process.env.NODE_ENV

// TODO: Organize configuration
module.exports = () => {
  const getEntries = () => {
    return glob
      .sync(`**/?(*.)bundle.{${[fileExtension.js, fileExtension.sass].join(',')}}`, {
        cwd: directory.dev
      })
      .reduce((entry, src) => {
        const name = path.format({
          dir: path.dirname(src),
          name: path.basename(src, path.extname(src))
        })
        entry[name] = path.resolve(directory.dev, src)
        return entry
      }, {})
  }

  const createTestRegex = extensions => new RegExp(`.(${extensions.replace(/,/g, '|')})$`)

  return {
    mode: ENV || 'development',
    entry: getEntries(),
    output: {
      path: directory.dest,
      filename: '[name].js',
      publicPath: '/'
    },
    devtool: ENV || 'inline-cheap-module-source-map',
    devServer: {
      host: ip(),
      disableHostCheck: true
    },
    module: {
      rules: [
        // JavaScript
        {
          test: createTestRegex(fileExtension.js),
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true }
          }
        },
        // Sass
        {
          test: createTestRegex(fileExtension.sass),
          use: [
            { loader: MiniCssExtractPlugin.loader },
            {
              loader: 'css-loader',
              options: { sourceMap: true }
            },
            {
              loader: 'postcss-loader',
              options: { sourceMap: true }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                sassOptions: { importer: nodeSassGlobImporter() }
              }
            }
          ]
        },
        // Pug
        {
          test: /.pug$/,
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: true,
                root: directory.dev
              }
            }
          ]
        }
      ]
    },
    resolve: {
      alias: {
        '@': path.resolve(directory.dev, directory.js)
      },
      extensions: fileExtension.js.split(',').map(extension => `.${extension}`)
    },
    optimization: {
      splitChunks: {
        chunks: 'initial',
        minChunks: 2,
        name: path.join(directory.js, 'vendor')
      }
    },
    plugins: [
      ...glob.sync(`**/[!_]*.${fileExtension.pug}`, { cwd: directory.dev }).map(src => {
        return new HtmlWebpackPlugin({
          template: path.resolve(directory.dev, src),
          filename: path.format({
            dir: path.dirname(path.resolve(directory.dest, src)),
            name: path.basename(src, path.extname(src)),
            ext: '.html'
          }),
          inject: false,
          minify: { collapseWhitespace: !!ENV }
        })
      }),
      new FixStyleOnlyEntriesPlugin({
        extensions: fileExtension.sass.split(',')
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new CopyWebpackPlugin([
        {
          from: `${directory.dev}/**/*.{${fileExtension.resource}}`,
          to: `${directory.dest}/[name].[ext]`
        }
      ]),
      new ImageminPlugin({
        test: /\.(jpe?g|png|gif|svg)$/i,
        options: {
          svgo: { removeViewBox: false }
        },
        externalImages: {
          context: directory.dev,
          sources: glob.sync(`${directory.dev}/**/*.{${fileExtension.image}}`),
          destination: directory.dest,
          fileName: '[path][name].[ext]'
        }
      })
    ],
    stats: ENV ? 'verbose' : 'minimal'
  }
}
