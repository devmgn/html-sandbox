/**
 * Jest Configuration
 * @see https://jestjs.io
 */

const path = require('path');
const { directory, javascriptPattern } = require('./config');

module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': path.join('<rootDir>', directory.src, directory.javascript, '$1'),
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  testMatch: [path.join('<rootDir>', `test/**/*.(spec|test).${javascriptPattern}`)],
};
