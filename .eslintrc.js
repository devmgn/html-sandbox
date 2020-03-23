/**
 * ESLint configuration
 * @see https://eslint.org
 */

const { directory } = require('./config')

module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    'jest/globals': true,
  },
  extends: ['standard', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
  plugins: ['prettier', 'jest'],
  parserOptions: {
    sourceType: 'module',
    project: 'tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-console': 0,
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        singleQuote: true,
        semi: false,
      },
    ],
    'no-multi-spaces': [
      'error',
      {
        exceptions: {
          ImportDeclaration: true,
          Property: false,
          VariableDeclarator: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint'],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
    },
  ],
  ignorePatterns: ['node_modules', '!.*rc.js', directory.dist],
}
