/**
 * Webpack configuration
 * https://webpack.js.org
 */

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const glob = require('glob')
const path = require('path')
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
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const { directory, fileExtension } = require('./config')
const ENV = process.env.NODE_ENV

// utilities
const extensionString = {
  toGlobString: string => string.replace(/[ .]/g, ''),
  toArray: string => string.split(',').map(extension => `.${extension.trim().replace('.', '')}`),
  toRegExp: string => {
    const extensions = string.split(',')
    const pattern = extensions.map(extension => extension.trim().replace('.', '')).join('|')
    return new RegExp(extensions.length > 1 ? `.(${pattern})$` : `.${pattern}$`, 'i')
  }
}

const getMultipleEntry = () => {
  const sassExtensionString = extensionString.toGlobString(fileExtension.sass)
  const jsExtensionString = extensionString.toGlobString(fileExtension.js)
  return glob
    .sync(`**/*/@([^_]*.{${sassExtensionString}}|?(*.)bundle.{${jsExtensionString}})`, { cwd: directory.dev })
    .reduce((entry, src) => {
      const name = path.format({
        dir: path.dirname(src),
        name: path.basename(src, path.extname(src))
      })
      entry[name] = path.resolve(directory.dev, src)
      return entry
    }, {})
}

module.exports = () => {
  return {
    mode: ENV || 'development',
    entry: getMultipleEntry(),
    output: {
      path: path.join(directory.root, directory.dest, directory.publicPath),
      filename: '[name]-[contenthash:16].js',
      publicPath: directory.publicPath
    },
    module: {
      rules: [
        // JavaScript
        {
          test: extensionString.toRegExp(fileExtension.js),
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true }
          }
        },
        // Sass
        {
          test: extensionString.toRegExp(fileExtension.sass),
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
          test: extensionString.toRegExp(fileExtension.template),
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: true,
                root: path.join(directory.root, directory.dev)
              }
            }
          ]
        },
        // Assets
        {
          test: extensionString.toRegExp(fileExtension.asset),
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: parseInt(1024 / 4),
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
        '@': path.join(directory.root, directory.dev, directory.js)
      },
      modules: ['node_modules', path.join(directory.dev, directory.images)],
      extensions: extensionString.toArray(fileExtension.js)
    },
    optimization: {
      splitChunks: {
        chunks: 'initial',
        minChunks: 2,
        name: path.join(directory.js, 'vendor')
      }
    },
    plugins: [
      ...glob
        .sync(`**/[!_]*.${extensionString.toGlobString(fileExtension.template)}`, {
          cwd: directory.dev
        })
        .map(src => {
          return new HtmlWebpackPlugin({
            template: path.join(directory.dev, src),
            filename: path.format({
              dir: path.dirname(src),
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
      new MiniCssExtractPlugin({ filename: '[name]-[contenthash:16].css' }),
      new FixStyleOnlyEntriesPlugin({ extensions: extensionString.toArray(fileExtension.sass) }),
      new CopyWebpackPlugin([
        {
          from: path.join(directory.dev, `**/*.{${extensionString.toGlobString(fileExtension.resource)}}`),
          to: path.join(directory.root, directory.dest, directory.publicPath, '[name].[ext]')
        }
      ]),
      new FriendlyErrorsWebpackPlugin()
    ],
    devtool: ENV || 'inline-cheap-module-source-map',
    devServer: {
      open: true,
      openPage: directory.publicPath.replace(path.sep, ''),
      contentBase: directory.dest,
      host: '0.0.0.0',
      useLocalIp: true,
      disableHostCheck: true
    },
    stats: ENV ? 'verbose' : 'minimal'
  }
}
