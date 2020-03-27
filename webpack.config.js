/**
 * Webpack configuration
 * @see https://webpack.js.org
 */

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
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const ENV = process.env.NODE_ENV
const { directory, fileExtension, svgoOptions, interpolateName } = require('./config')
const { ExtensionString, ConvertPath } = require('./utilities')

const getMultipleEntry = () => {
  const sassFileTypes = ExtensionString.toGlobFileTypes(fileExtension.sass)
  const jsFileTypes = ExtensionString.toGlobFileTypes(fileExtension.js)
  return glob
    .sync(`**/@([^_]*.${sassFileTypes}|?(*.)bundle.${jsFileTypes})`, { cwd: directory.src })
    .reduce((entry, src) => {
      const name = path.format({
        dir: path.dirname(src),
        name: path.basename(src, path.extname(src)),
      })
      entry[name] = path.resolve(directory.src, src)
      return entry
    }, {})
}

module.exports = () => {
  return {
    mode: ENV || 'development',
    entry: getMultipleEntry(),
    output: {
      path: path.join(directory.root, directory.dist, directory.publicPath),
      filename: `${interpolateName}.js`,
      publicPath: directory.publicPath,
    },
    module: {
      rules: [
        // JavaScript
        {
          test: ExtensionString.toFileTypesRegExp(fileExtension.js),
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
        },
        // Sass
        {
          test: ExtensionString.toFileTypesRegExp(fileExtension.sass),
          use: [
            { loader: MiniCssExtractPlugin.loader },
            {
              loader: 'css-loader',
              options: { sourceMap: true },
            },
            {
              loader: 'postcss-loader',
              options: { sourceMap: true },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                sassOptions: { importer: nodeSassGlobImporter() },
              },
            },
          ],
        },
        // Pug
        {
          test: ExtensionString.toFileTypesRegExp(fileExtension.template),
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
          test: ExtensionString.toFileTypesRegExp(fileExtension.asset),
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: parseInt(1024 / 4),
                name: (resourcePath) => {
                  return `${path.join(
                    path.dirname(path.relative(directory.src, resourcePath)),
                    `${interpolateName}.[ext]`
                  )}`
                },
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
      ],
    },
    resolve: {
      alias: {
        '@': path.join(directory.root, directory.src, directory.js),
      },
      modules: ['node_modules', path.join(directory.src, directory.images), path.join(directory.src, directory.fonts)],
      extensions: ExtensionString.toArray(fileExtension.js),
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'initial',
            minChunks: 2,
            name: path.join(directory.js, 'vendor'),
            enforce: true,
          },
        },
      },
    },
    plugins: [
      ...glob
        .sync(`**/[!_]*.${ExtensionString.toGlobFileTypes(fileExtension.template)}`, { cwd: directory.src })
        .map((src) => {
          return new HtmlWebpackPlugin({
            template: path.join(directory.src, src),
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
      new MiniCssExtractPlugin({ filename: `${interpolateName}.css` }),
      new FixStyleOnlyEntriesPlugin({ extensions: ExtensionString.toArray(fileExtension.sass) }),
      new CopyWebpackPlugin([
        {
          from: path.resolve(directory.src, `**/*.${ExtensionString.toGlobFileTypes(fileExtension.resource)}`),
          to: '[path][name].[ext]',
          context: directory.src,
        },
      ]),
      new FriendlyErrorsWebpackPlugin(),
      new CleanWebpackPlugin(),
    ],
    devtool: ENV || 'inline-cheap-module-source-map',
    devServer: { openPage: ConvertPath.toRelativePath(directory.publicPath) },
  }
}
