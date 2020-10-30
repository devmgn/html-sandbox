/**
 * Basic configurations
 */

/** @typedef { { src: string; dist: string; javascript: string; publicPath: string; } } Directory */
/** @typedef { { asset: string; resource: string } } Extension */
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

  /** @type { Extension } */
  extension: config.extension,

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
   * // TODO: fix webpack5 deprecation warning
   * @see https://webpack.js.org/configuration/output/#outputfilename
   * @type { string }
   */
  placeholder: '[name]-[hash]',

  /** @type { string } */
  javascriptGlobPattern: '[jt]s?(x)',
}
