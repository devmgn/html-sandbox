/**
 * Basic configurations
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const root = path.resolve(__dirname)
const { config } = require(path.join(root, 'package.json'))

// extend path
path.toRelativePath = input => (path.isAbsolute(input) ? input.replace(path.parse(input).root, '') : input)
path.toAbsolutePath = input => (path.isAbsolute(input) ? input : path.join(path.sep, input))

Object.assign(config.directory, {
  root,
  dev: path.toRelativePath(path.normalize(config.directory.dev)),
  dest: path.toRelativePath(path.normalize(config.directory.dest)),
  publicPath: path.toAbsolutePath(path.normalize(config.directory.publicPath)),
  css: path.toRelativePath(path.normalize(config.directory.css)),
  js: path.toRelativePath(path.normalize(config.directory.js)),
  images: path.toRelativePath(path.normalize(config.directory.images))
})

module.exports = config
