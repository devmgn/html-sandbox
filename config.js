/**
 * Basic configurations
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const { config } = require('./package.json') // import configures from `package.json`
const { ConvertPath } = require('./utilities')

Object.assign(config.directory, {
  root: path.resolve(__dirname),
  src: ConvertPath.toRelativePath(config.directory.src),
  dist: ConvertPath.toRelativePath(config.directory.dist),
  publicPath: ConvertPath.toAbsolutePath(config.directory.publicPath),
  css: ConvertPath.toRelativePath(config.directory.css),
  js: ConvertPath.toRelativePath(config.directory.js),
  images: ConvertPath.toRelativePath(config.directory.images),
  fonts: ConvertPath.toRelativePath(config.directory.fonts),
})

// svgo options
// @see https://github.com/svg/svgo#what-it-can-do
config.svgoOptions = { plugins: [{ removeViewBox: false }] }

module.exports = config
