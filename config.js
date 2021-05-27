/**
 * Basic configurations
 */

/** @typedef { { src: string; dist: string; javascript: string; publicPath: string; } } Directory */

const path = require('path');
// eslint-disable-next-line import/extensions
const { config } = require('./package.json');

/**
 * Convert path to absolute or relative path
 */
class ConvertPath {
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
    const normalizedPath = `${path.normalize(targetPath).replace(new RegExp(`${path.sep}$`), '')}${path.sep}`;
    return path.isAbsolute(normalizedPath) ? normalizedPath : path.join(path.sep, normalizedPath);
  }
}

module.exports = {
  /** @type { Directory } */
  directory: {
    src: ConvertPath.toRelative(config.directory.src),
    dist: ConvertPath.toRelative(config.directory.dist),
    javascript: ConvertPath.toRelative(config.directory.javascript),
    publicPath: ConvertPath.toAbsolute(config.directory.publicPath),
  },

  /** @type { RegExp } */
  resourcesRegExp: new RegExp(config.resourcesRegExp, 'i'),

  /** @type { string } */
  targetsPatternToCopy: config.targetsPatternToCopy,

  /**
   * placeholder
   * @type { string }
   */
  placeholders: config.placeholders,

  /** @type { string } */
  javascriptPattern: '[jt]s?(x)',
};
