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
const WebpackFixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// configurations and utilities
const { directory, extension, javascriptGlobPattern, svgoOptions, placeholder } = require('./config')
const { ExtensionString } = require('./utilities')

module.exports = () => {
  const isProductionBuild = process.env.NODE_ENV === 'production'

  const getMultipleEntry = () => {
    return glob
      .sync(`**/@(?(*.)bundle.${javascriptGlobPattern}|[^_]*.s[ac]ss)`, { cwd: directory.src })
      .reduce((entry, src) => {
        const name = path.format({
          dir: path.dirname(src),
          name: path.parse(src).name,
        })
        entry[name] = path.resolve(directory.src, src)
        return entry
      }, {})
  }

  const getAssetModuleOption = () => {
    return {
      type: 'asset',
      parser: {
        dataUrlCondition: {
          maxSize: 1024 / 4,
        },
      },
    }
  }

  return {
    mode: isProductionBuild ? 'production' : 'development',
    entry: getMultipleEntry(),
    output: {
      path: path.resolve(directory.dist),
      filename: `${placeholder}.js`,
      publicPath: isProductionBuild ? directory.publicPath : '/',
      assetModuleFilename: (pathData) =>
        path.join(path.relative(directory.src, pathData.module.context), `${placeholder}[ext]`),
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
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: !isProductionBuild,
                importLoaders: 2,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !isProductionBuild,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: !isProductionBuild,
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
          test: ExtensionString.toFileTypesRegExp(extension.asset),
          type: 'asset/resource',
        },
        // Raster Images
        ...[/\.jpe?g$/i, /\.png$/i, /\.gif$/i, /\.webp$/i].map((pattern, index) => {
          const plugins = [imageminJpegtran(), imageminOptipng(), imageminGifsicle(), imageminWebp()]
          return {
            test: pattern,
            ...getAssetModuleOption(),
            use: [
              {
                loader: 'img-loader',
                options: {
                  plugins: [plugins[index]],
                },
              },
            ],
          }
        }),
        // svg
        {
          test: /\.svg$/i,
          use: [
            {
              loader: 'img-loader',
              options: {
                plugins: [imageminSvgo(svgoOptions)],
              },
            },
          ],
          oneOf: [
            // inline svg
            {
              resourceQuery: /inline/,
              type: 'asset/source',
            },
            // TODO: fix webpack5 problems
            // @see https://github.com/JetBrains/svg-sprite-loader/issues/413
            // sprite svg
            // {
            //   resourceQuery: /sprite/,
            //   use: [
            //     {
            //       loader: 'svg-sprite-loader',
            //       options: {
            //         symbolId: (filePath) => path.basename(filePath, '.svg'),
            //       },
            //     },
            //   ],
            // },
            // default
            {
              ...getAssetModuleOption(),
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
          })
        }),
      new MiniCssExtractPlugin({
        filename: `${placeholder}.css`,
      }),
      // TODO: fix webpack5 deprecation warning
      // @see https://github.com/fqborges/webpack-fix-style-only-entries/issues/31
      new WebpackFixStyleOnlyEntriesPlugin({
        silent: !isProductionBuild,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(directory.src, `**/*.${ExtensionString.toGlobFileTypes(extension.resource)}`),
            to: '[path][name].[ext]',
            context: directory.src,
            noErrorOnMissing: true,
          },
        ],
      }),
      new CleanWebpackPlugin(),
      new FriendlyErrorsWebpackPlugin(),
    ],
    devtool: !isProductionBuild && 'source-map',
    cache: {
      type: 'filesystem',
    },
    // TODO: fix webpack5 problems
    // @see https://github.com/webpack/webpack-dev-server/issues/2765
    // @see https://github.com/webpack/webpack-dev-server/issues/2758
    devServer: {
      open: true,
    },
  }
}
