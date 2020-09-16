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
const imageminWebp = require('imagemin-webp')
const imageminSvgo = require('imagemin-svgo')

// webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const ENV = process.env.NODE_ENV
const { pathname, extension, svgoOptions, placeholder, inlineSVGRegEXP, SVGSpriteRegEXP } = require('./config')
const { ExtensionString } = require('./utilities')

const getMultipleEntry = () => {
  return [
    ...glob.sync(`**/?(*.)bundle.${ExtensionString.toGlobFileTypes(extension.javascript)}`, { cwd: pathname.src }),
    ...glob.sync(`**/[^_]*.{sass,scss}`, { cwd: pathname.src }),
  ].reduce((entry, src) => {
    const name = path.format({
      dir: path.dirname(src),
      name: path.parse(src).name,
    })
    entry[name] = path.resolve(pathname.src, src)
    return entry
  }, {})
}

const ulrLoaderOptions = {
  loader: 'url-loader',
  options: {
    limit: parseInt(1024 / 4),
    name: (resourcePath) =>
      `${path.join(path.dirname(path.relative(pathname.src, resourcePath)), `${placeholder}.[ext]`)}`,
  },
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
          test: /.s[ac]ss$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                importLoaders: 2,
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
          test: /.pug$/i,
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
          use: [ulrLoaderOptions],
        },
        // .jpg
        {
          test: /.jpe?g$/i,
          use: [
            ulrLoaderOptions,
            {
              loader: 'img-loader',
              options: {
                plugins: [imageminJpegtran()],
              },
            },
          ],
        },
        // .png
        {
          test: /.png$/i,
          use: [
            ulrLoaderOptions,
            {
              loader: 'img-loader',
              options: {
                plugins: [imageminOptipng()],
              },
            },
          ],
        },
        // .gif
        {
          test: /.gif$/i,
          use: [
            ulrLoaderOptions,
            {
              loader: 'img-loader',
              options: {
                plugins: [imageminGifsicle()],
              },
            },
          ],
        },
        // .webp
        {
          test: /.webp$/i,
          use: [
            ulrLoaderOptions,
            {
              loader: 'img-loader',
              options: {
                plugins: [imageminWebp()],
              },
            },
          ],
        },
        // .svg
        {
          test: /.svg$/i,
          exclude: [inlineSVGRegEXP, SVGSpriteRegEXP],
          use: [
            ulrLoaderOptions,
            {
              loader: 'img-loader',
              options: {
                plugins: [imageminSvgo(svgoOptions)],
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
        // SVG sprite
        {
          test: SVGSpriteRegEXP,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                symbolId: (filePath) => path.basename(filePath, '.svg').replace(/\.sprite$/i, ''),
              },
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
        .sync('**/[!_]*.pug', {
          cwd: pathname.src,
        })
        .map((src) => {
          return new HtmlWebpackPlugin({
            template: path.join(pathname.src, src),
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
    devtool: ENV || 'cheap-module-source-map',
  }
}
