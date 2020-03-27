/**
 * lint-staged configuration
 * @see https://github.com/okonet/lint-staged
 */

const path = require('path')
const { directory, fileExtension } = require('./config')
const { ExtensionString } = require('./utilities')

module.exports = {
  [`${path.join(directory.src, `**/*.${ExtensionString.toGlobFileTypes(fileExtension.template)}`)}`]: () =>
    'yarn lint:template',
  [`**/*.${ExtensionString.toGlobFileTypes(fileExtension.js)}`]: () => 'run-s lint:js lint:typescript',
}
