/**
 * Jest Configuration
 * https://jestjs.io
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { directory } = require('./config')

module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': `${directory.dev}/$1`
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  testMatch: [`${directory.dev}/**/?(*.)(spec|test).(ts|js)?(x)`]
}
