/**
 * Basic configurations
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const root = path.resolve(__dirname)
const { config } = require(path.resolve(root, 'package.json'))

Object.assign(config.directory, {
  root,
  dev: path.resolve(root, config.directory.dev),
  baseDir: path.resolve(root, config.directory.dest),
  dest: path.resolve(root, config.directory.dest)
})

module.exports = config
