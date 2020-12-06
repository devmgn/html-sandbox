/**
 * Utility scripts
 */

const path = require('path')
const SEPARATOR_REGEXP = new RegExp(`${path.sep}$`)

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
