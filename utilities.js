/**
 * Utility scripts
 */

const path = require('path')
const COMMA_AND_SPACE_REGEXP = /[ .]/g

/**
 * Format extension string defined in `package.json`
 */
module.exports.ExtensionString = class {
  static toGlobFileTypes(string) {
    const fileTypes = string.replace(COMMA_AND_SPACE_REGEXP, '')
    return string.split(',').length > 1 ? `{${fileTypes}}` : fileTypes
  }

  static toArray(strings) {
    return strings.split(',').map((extension) => `.${extension.replace(COMMA_AND_SPACE_REGEXP, '')}`)
  }

  static toFileTypesRegExp(string) {
    const pattern = string
      .split(',')
      .map((extension) => extension.replace(COMMA_AND_SPACE_REGEXP, ''))
      .join('|')
    return new RegExp(`.(${pattern})$`, 'i')
  }
}

/**
 * Convert path to absolute or relative path
 */
module.exports.ConvertPath = class {
  static toRelativePath(targetPath) {
    targetPath = path.normalize(targetPath)
    return path.isAbsolute(targetPath) ? targetPath.replace(path.parse(targetPath).root, '') : targetPath
  }

  static toAbsolutePath(targetPath) {
    targetPath = path.normalize(targetPath)
    return path.isAbsolute(targetPath) ? targetPath : path.join(path.sep, targetPath)
  }
}
