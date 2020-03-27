/**
 * Jest Configuration
 * @see https://jestjs.io
 */

const path = require('path')
const { directory } = require('./config')

module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': path.join('<rootDir>', directory.src, directory.js, '$1'),
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testMatch: [path.join('<rootDir>', 'test/**/?(*.)(spec|test).[tj]s?(x)')],
}
