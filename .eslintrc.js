/**
 * ESLint configuration
 * - https://eslint.org
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    'jest/globals': true
  },
  extends: [
    'standard',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
  ],
  plugins: [
    'prettier',
    '@typescript-eslint',
    'jest'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: 'tsconfig.json',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-console': 0,
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        singleQuote: true,
        semi: false
      }
    ],
    'no-multi-spaces': [
      'error',
      {
        exceptions: {
          ImportDeclaration: true,
          Property: false,
          VariableDeclarator: true
        }
      }
    ]
  }
}
