/**
 * lint-staged configuration
 * @see https://github.com/okonet/lint-staged
 */

const path = require('path')
const { pathname, extension } = require('./config')
const { ExtensionString } = require('./utilities')

module.exports = {
  [`${path.join(pathname.src, '**/*.pug')}`]: () => 'yarn lint:template',
  [`**/*.${ExtensionString.toGlobFileTypes(extension.javascript)}`]: () => 'run-s lint:javascript lint:typescript',
}
