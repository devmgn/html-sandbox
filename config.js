/**
 * Basic configurations
 */

const { config } = require('./package.json')
const { ConvertPath } = require('./utilities')

module.exports = {
  directory: {
    src: ConvertPath.toRelativePath(config.directory.src),
    dist: ConvertPath.toRelativePath(config.directory.dist),
    javascript: ConvertPath.toRelativePath(config.directory.javascript),
    publicPath: ConvertPath.toAbsolutePath(config.directory.publicPath),
  },

  extension: config.extension,

  /**
   * svgo options
   * @see https://github.com/svg/svgo#what-it-can-do
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
   * @see https://webpack.js.org/configuration/output/#outputfilename
   */
  placeholder: '[name]-[hash]',

  javascriptGlobPattern: '[jt]s?(x)',
}
