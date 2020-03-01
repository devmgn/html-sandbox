/**
 * Jest Configuration
 * https://jestjs.io
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const { directory } = require('./config')

module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(directory.dev, directory.js, '$1')
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  testMatch: [path.resolve(directory.root, 'test/**/?(*.)(spec|test).(ts|js)?(x)')]
}
