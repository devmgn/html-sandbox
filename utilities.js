/**
 * Utility scripts
 */

const path = require('path');

const SEPARATOR_REGEXP = new RegExp(`${path.sep}$`);

/**
 * Convert path to absolute or relative path
 */
module.exports.ConvertPath = class {
  /**
   * @param { string } targetPath
   * @returns { string }
   */
  static toRelative(targetPath) {
    const normalizedPath = path.normalize(targetPath);
    return path.isAbsolute(normalizedPath)
      ? normalizedPath.replace(path.parse(normalizedPath).root, '')
      : normalizedPath;
  }

  /**
   * @param { string } targetPath
   * @returns { string }
   */
  static toAbsolute(targetPath) {
    const normalizedPath = `${path.normalize(targetPath).replace(SEPARATOR_REGEXP, '')}${path.sep}`;
    return path.isAbsolute(normalizedPath) ? normalizedPath : path.join(path.sep, normalizedPath);
  }
};
