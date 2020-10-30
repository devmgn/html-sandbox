/**
 * Utility scripts
 */

const path = require('path')
const SPACE_AND_COMMA_REGEXP = /[ .]/g
const SEPARATOR_REGEXP = new RegExp(`${path.sep}$`)

/**
 * Format the extension string defined in `package.json`
 */
module.exports.ExtensionString = class {
  /**
   * @param { string } string
   * @returns { string }
   */
  static toGlobPattern(string) {
    const fileTypes = string.replace(SPACE_AND_COMMA_REGEXP, '')
    return string.split(',').length > 1 ? `{${fileTypes}}` : fileTypes
  }

  /**
   * @param { string } string
   * @returns { RegExp }
   */
  static toRegExp(string) {
    const pattern = string
      .split(',')
      .map((extension) => extension.replace(SPACE_AND_COMMA_REGEXP, ''))
      .join('|')
    return new RegExp(`\\.(${pattern})$`, 'i')
  }
}

/**
 * Convert path to absolute or relative path
 */
module.exports.ConvertPath = class {
  /**
   * @param { string } targetPath
   * @returns { string }
   */
  static toRelative(targetPath) {
    targetPath = path.normalize(targetPath)
    return path.isAbsolute(targetPath) ? targetPath.replace(path.parse(targetPath).root, '') : targetPath
  }

  /**
   * @param { string } targetPath
   * @returns { string }
   */
  static toAbsolute(targetPath) {
    targetPath = `${path.normalize(targetPath).replace(SEPARATOR_REGEXP, '')}/`
    return path.isAbsolute(targetPath) ? targetPath : path.join(path.sep, targetPath)
  }
}
