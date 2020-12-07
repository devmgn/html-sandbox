/**
 * Webpack configuration
 * @see https://webpack.js.org
 */

/** @typedef { import('webpack').Configuration } WebpackConfiguration */
/** @typedef { import('webpack').RuleSetRule } WebpackRuleSetRule */
/** @typedef { import('svg-sprite-loader') } SVGLoaderOptions */

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
// @ts-ignore
// TODO: fix types
const WebpackRemoveEmptyScripts = require('webpack-remove-empty-scripts')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

// configurations
const { directory, javascriptGlobPattern, svgoOptions, placeholder, resolvedTarget, copyTarget } = require('./config')

/** @returns { WebpackConfiguration } */
module.exports = () => {
  const isProductionBuild = process.env.NODE_ENV === 'production'

  const getMultipleEntry = () => {
    /** @type { { [key: string]: string } } */
    const initialEntry = {}
    return glob
      .sync(`**/@(?(*.)bundle.${javascriptGlobPattern}|[^_]*.s[ac]ss)`, { cwd: directory.src })
      .reduce((entry, src) => {
        const name = path.format({
          dir: path.dirname(src),
          name: path.parse(src).name,
        })
        entry[name] = path.resolve(directory.src, src)
        return entry
      }, initialEntry)
  }

  /** @type { WebpackRuleSetRule } */
  const assetModuleOptions = {
    type: 'asset',
    parser: {
      dataUrlCondition: {
        maxSize: 1024 / 4,
      },
    },
  }

  /** @type { WebpackRuleSetRule } */
  const imageminSvgOptions = {
    loader: 'img-loader',
    options: {
      plugins: [imageminSvgo(svgoOptions)],
    },
  }

  return {
    mode: isProductionBuild ? 'production' : 'development',
    entry: getMultipleEntry(),
    output: {
      path: path.resolve(directory.dist),
      filename: `${placeholder}.js`,
      publicPath: isProductionBuild ? directory.publicPath : '/',
      assetModuleFilename: (pathData) => {
        return pathData.filename
          ? path.join(path.relative(directory.src, path.dirname(pathData.filename)), `${placeholder}[ext]`)
          : ''
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
          test: resolvedTarget,
          type: 'asset/resource',
        },
        // Raster Images
        ...[/\.jpe?g$/i, /\.png$/i, /\.gif$/i, /\.webp$/i].map((pattern, index) => {
          const plugins = [imageminJpegtran(), imageminOptipng(), imageminGifsicle(), imageminWebp()]
          return {
            test: pattern,
            ...assetModuleOptions,
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
          oneOf: [
            // inline svg
            {
              resourceQuery: /inline/,
              type: 'asset/source',
              use: [imageminSvgOptions],
            },
            // sprite svg
            {
              resourceQuery: /sprite/,
              use: [
                {
                  loader: 'svg-sprite-loader',
                  options: {
                    /** @type { SVGLoaderOptions } */
                    symbolId: (filePath) => {
                      if (typeof filePath !== 'string') return
                      return path.basename(filePath, '.svg')
                    },
                  },
                },
                imageminSvgOptions,
              ],
            },
            // default
            {
              ...assetModuleOptions,
              use: [imageminSvgOptions],
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
      // TODO: fix webpack5 deprecation warning
      // @see https://github.com/jantimon/html-webpack-plugin/issues/1527
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
      // Use the 'webpack-remove-empty-scripts' plugin in the interim until 'webpack-fix-style-only-entries' is fixed
      // @see https://github.com/fqborges/webpack-fix-style-only-entries/issues/31
      new WebpackRemoveEmptyScripts({
        silent: !isProductionBuild,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: copyTarget,
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
