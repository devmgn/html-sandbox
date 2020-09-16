/**
 * Basic configurations
 */

const { config } = require('./package.json')
const { ConvertPath } = require('./utilities')

Object.assign(config.pathname, {
  src: ConvertPath.toRelativePath(config.pathname.src),
  dist: ConvertPath.toRelativePath(config.pathname.dist),
  javascript: ConvertPath.toRelativePath(config.pathname.javascript),
  publicPath: ConvertPath.toAbsolutePath(config.pathname.publicPath),
})

/**
 * svgo options
 * @see https://github.com/svg/svgo#what-it-can-do
 */
config.svgoOptions = {
  plugins: [
    {
      removeAttrs: { attrs: 'data.*' },
      removeDimensions: true,
      removeViewBox: false,
    },
  ],
}

/**
 * placeholder
 * @see https://webpack.js.org/configuration/output/#outputfilename
 */
config.placeholder = '[name]-[contenthash:16]'

config.inlineSVGRegEXP = /.inline.svg$/i
config.SVGSpriteRegEXP = /.sprite.svg$/i

module.exports = config
