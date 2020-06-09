/**
 * Webpack configuration
 * @see https://webpack.js.org
 */

const glob = require('glob')
const path = require('path')
const sass = require('sass')
const fibers = require('fibers')
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
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const ENV = process.env.NODE_ENV
const { pathname, extension, svgoOptions, placeholder, inlineSVGRegEXP } = require('./config')
const { ExtensionString } = require('./utilities')

const getMultipleEntry = () => {
  return [
    ...glob.sync(`**/[^_]*.${ExtensionString.toGlobFileTypes(extension.sass)}`, { cwd: pathname.src }),
    ...glob.sync(`**/?(*.)bundle.${ExtensionString.toGlobFileTypes(extension.javascript)}`, { cwd: pathname.src }),
  ].reduce((entry, src) => {
    const name = path.format({
      dir: path.dirname(src),
      name: path.basename(src, path.extname(src)),
    })
    entry[name] = path.resolve(pathname.src, src)
    return entry
  }, {})
}

module.exports = () => {
  return {
    mode: ENV || 'development',
    entry: getMultipleEntry(),
    output: {
      path: path.resolve(pathname.dist),
      filename: `${placeholder}.js`,
      publicPath: ENV === 'production' ? pathname.publicPath : '/',
    },
    module: {
      rules: [
        // JavaScript
        {
          test: ExtensionString.toFileTypesRegExp(extension.javascript),
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
          test: ExtensionString.toFileTypesRegExp(extension.sass),
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                implementation: sass,
                sassOptions: {
                  fiber: fibers,
                  importer: nodeSassGlobImporter(),
                },
              },
            },
          ],
        },
        // Pug
        {
          test: ExtensionString.toFileTypesRegExp(extension.template),
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: true,
                root: path.resolve(pathname.src),
              },
            },
          ],
        },
        // Assets
        {
          test: ExtensionString.toFileTypesRegExp(extension.asset),
          exclude: inlineSVGRegEXP,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: parseInt(1024 / 4),
                name: (resourcePath) =>
                  `${path.join(path.dirname(path.relative(pathname.src, resourcePath)), `${placeholder}.[ext]`)}`,
              },
            },
            {
              loader: 'img-loader',
              options: {
                plugins: [imageminJpegtran(), imageminGifsicle(), imageminOptipng(), imageminSvgo(svgoOptions)],
              },
            },
          ],
        },
        // inline SVG
        {
          test: inlineSVGRegEXP,
          use: [
            {
              loader: 'raw-loader',
            },
            {
              loader: 'img-loader',
              options: {
                plugins: [imageminSvgo(svgoOptions)],
              },
            },
          ],
        },
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(pathname.src, pathname.javascript),
      },
      modules: ['node_modules', pathname.src],
      extensions: ExtensionString.toArray(extension.javascript),
    },
    optimization: {
      chunkIds: 'total-size',
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'initial',
            minChunks: 2,
            name: path.join(pathname.javascript, 'vendor'),
            enforce: true,
          },
        },
      },
    },
    plugins: [
      ...glob
        .sync(`**/[!_]*.${ExtensionString.toGlobFileTypes(extension.template)}`, {
          cwd: pathname.src,
        })
        .map((src) => {
          return new HtmlWebpackPlugin({
            template: path.join(pathname.src, src),
            filename: path.format({
              dir: path.dirname(src),
              name: path.basename(src, path.extname(src)),
              ext: '.html',
            }),
            inject: false,
            minify: {
              // HTMLMinifier
              // @see https://github.com/DanielRuf/html-minifier-terser#options-quick-reference
              removeStyleLinkTypeAttributes: true,
              removeScriptTypeAttributes: true,
              collapseBooleanAttributes: true,
              collapseWhitespace: !!ENV,
            },
          })
        }),
      new MiniCssExtractPlugin({
        filename: `${placeholder}.css`,
      }),
      new FixStyleOnlyEntriesPlugin({
        silent: !!ENV,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(pathname.src, `**/*.${ExtensionString.toGlobFileTypes(extension.resource)}`),
            to: '[path][name].[ext]',
            context: pathname.src,
            noErrorOnMissing: true,
          },
        ],
      }),
      new CleanWebpackPlugin(),
      new FriendlyErrorsWebpackPlugin(),
    ],
    devtool: ENV || 'inline-cheap-module-source-map',
  }
}
