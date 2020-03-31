/**
 * Utility scripts
 */

const path = require('path')
const SPACE_AND_COMMA_REGEXP = /[ .]/g
const SEPARATOR_REGEXP = new RegExp(`${path.sep}$`)

/**
 * Format extension string defined in `package.json`
 */
module.exports.ExtensionString = class {
  static toGlobFileTypes(string) {
    const fileTypes = string.replace(SPACE_AND_COMMA_REGEXP, '')
    return string.split(',').length > 1 ? `{${fileTypes}}` : fileTypes
  }

  static toArray(string) {
    return string.split(',').map((extension) => `.${extension.replace(SPACE_AND_COMMA_REGEXP, '')}`)
  }

  static toFileTypesRegExp(string) {
    const pattern = string
      .split(',')
      .map((extension) => extension.replace(SPACE_AND_COMMA_REGEXP, ''))
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
    targetPath = `${path.normalize(targetPath).replace(SEPARATOR_REGEXP, '')}/`
    console.log(targetPath)
    return path.isAbsolute(targetPath) ? targetPath : path.join(path.sep, targetPath)
  }
}
