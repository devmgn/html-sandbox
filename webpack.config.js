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
const imageminJpegtran = require('imagemin-jpegtran')
const imageminOptipng = require('imagemin-optipng')
const imageminGifsicle = require('imagemin-gifsicle')
const imageminSvgo = require('imagemin-svgo')

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const { directory, fileExtension } = require('./config')
const ENV = process.env.NODE_ENV

const getEntries = () => {
  return [
    ...glob.sync(`**/*/[^_]*.{${fileExtension.sass.replace('.', '')}}`, { cwd: directory.dev }),
    ...glob.sync(`**/*/?(*.)bundle.{${fileExtension.js.replace('.', '')}}`, { cwd: directory.dev })
  ].reduce((entry, src) => {
    const name = path.format({
      dir: path.dirname(src),
      name: path.basename(src, path.extname(src))
    })
    entry[name] = path.resolve(directory.dev, src)
    return entry
  }, {})
}

const createTestRegex = extensions => {
  const splittedExtension = extensions.split(',')
  const formattedExtension = splittedExtension.map(extension => extension.trim().replace('.', '')).join('|')
  if (splittedExtension.length > 1) {
    return new RegExp(`.(${formattedExtension})$`, 'i')
  } else {
    return new RegExp(`.${formattedExtension}$`, 'i')
  }
}

// TODO: Organize configuration
module.exports = () => {
  return {
    mode: ENV || 'development',
    entry: getEntries(),
    output: {
      path: directory.dest,
      filename: '[name]-[contenthash:16].js',
      publicPath: directory.publicPath
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
          test: createTestRegex(fileExtension.pug),
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: true,
                root: directory.dev
              }
            }
          ]
        },
        // Images
        {
          test: createTestRegex(fileExtension.image),
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: parseInt(1024 * 2),
                name: '[name]-[contenthash:16].[ext]',
                outputPath: (url, resourcePath) =>
                  path.join(path.dirname(path.relative(directory.dev, resourcePath)), url)
              }
            },
            {
              loader: 'img-loader',
              options: {
                plugins: [
                  imageminJpegtran(),
                  imageminGifsicle(),
                  imageminOptipng(),
                  imageminSvgo({ plugins: [{ removeViewBox: false }] })
                ]
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
      modules: ['node_modules', path.resolve(directory.dev, directory.images)],
      extensions: fileExtension.js.split(',').map(extension => `.${extension.trim().replace('.', '')}`)
    },
    optimization: {
      splitChunks: {
        chunks: 'initial',
        minChunks: 2,
        name: path.join(directory.js, 'vendor')
      }
    },
    plugins: [
      ...glob.sync(`**/[!_]*.${fileExtension.pug.replace('.', '')}`, { cwd: directory.dev }).map(src => {
        return new HtmlWebpackPlugin({
          template: path.resolve(directory.dev, src),
          filename: path.format({
            dir: path.dirname(path.resolve(directory.dest, src)),
            name: path.basename(src, path.extname(src)),
            ext: '.html'
          }),
          inject: false,
          minify: {
            removeScriptTypeAttributes: true,
            collapseWhitespace: !!ENV
          }
        })
      }),
      new FixStyleOnlyEntriesPlugin({
        extensions: fileExtension.sass.split(',').map(extension => extension.trim().replace('.', ''))
      }),
      new MiniCssExtractPlugin({
        filename: '[name]-[contenthash:16].css'
      }),
      new CopyWebpackPlugin([
        {
          from: `${directory.dev}/**/*.{${fileExtension.resource.replace('.', '')}}`,
          to: `${directory.dest}/[name].[ext]`
        }
      ])
    ],
    devtool: ENV || 'inline-cheap-module-source-map',
    devServer: {
      open: true,
      contentBase: directory.dest,
      host: ip(),
      disableHostCheck: true
    },
    stats: ENV ? 'verbose' : 'minimal'
  }
}
