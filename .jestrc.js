/**
 * Jest Configuration
 * @see https://jestjs.io
 */

const path = require('path')
const { pathname } = require('./config')

module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': path.join('<rootDir>', pathname.src, pathname.javascript, '$1'),
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testMatch: [path.join('<rootDir>', 'test/**/*.(spec|test).[jt]s?(x)')],
}
