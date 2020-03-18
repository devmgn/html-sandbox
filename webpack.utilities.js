/**
 * Utilities for webpack.config.js
 */

const COMMA_AND_SPACE_REGEXP = /[ .]/g

module.exports.ExtensionString = class {
  static toGlobFileTypes(string) {
    return string.replace(COMMA_AND_SPACE_REGEXP, '')
  }

  static toArray(strings) {
    return strings.split(',').map(extension => `.${extension.replace(COMMA_AND_SPACE_REGEXP, '')}`)
  }

  static toFileTypesRegExp(string) {
    const pattern = string
      .split(',')
      .map(extension => extension.replace(COMMA_AND_SPACE_REGEXP, ''))
      .join('|')
    return new RegExp(`.(${pattern})$`, 'i')
  }
}
