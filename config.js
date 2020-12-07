/**
 * Basic configurations
 */

/** @typedef { { src: string; dist: string; javascript: string; publicPath: string; } } Directory */
/** @typedef { import('svgo').Options } SVGOOptions */

const { config } = require('./package.json')
const { ConvertPath } = require('./utilities')

module.exports = {
  /** @type { Directory } */
  directory: {
    src: ConvertPath.toRelative(config.directory.src),
    dist: ConvertPath.toRelative(config.directory.dist),
    javascript: ConvertPath.toRelative(config.directory.javascript),
    publicPath: ConvertPath.toAbsolute(config.directory.publicPath),
  },

  /** @type { RegExp } */
  resolvedTarget: new RegExp(config.resolvedTarget, 'i'),

  /** @type { string } */
  copyTarget: config.copyTarget,

  /**
   * svgo options
   * @see https://github.com/svg/svgo#what-it-can-do
   * @type { SVGOOptions }
   */
  svgoOptions: {
    plugins: [
      {
        removeAttrs: { attrs: 'data.*' },
        removeDimensions: true,
        removeViewBox: false,
      },
    ],
  },

  /**
   * placeholder
   * @type { string }
   */
  placeholder: '[name]-[contenthash]',

  /** @type { string } */
  javascriptGlobPattern: '[jt]s?(x)',
}
