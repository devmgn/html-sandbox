/**
 * lint-staged configuration
 * @see https://github.com/okonet/lint-staged
 */

const path = require('path')
const { directory, javascriptGlobPattern } = require('./config')

module.exports = {
  [`${path.join(directory.src, '**/*.pug')}`]: () => 'yarn lint:template',
  [`**/*.${javascriptGlobPattern}`]: () => 'run-s lint:javascript lint:typescript',
}
