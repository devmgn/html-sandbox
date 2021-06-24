/**
 * ESLint configuration
 * @see https://eslint.org
 */

const { directory } = require('./config');

module.exports = {
  root: true,
  env: {
    es2021: true,
    browser: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended', 'prettier'],
  rules: {
    'no-console': [
      'error',
      {
        allow: ['error', 'warn'],
      },
    ],
    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: true,
      },
    ],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        project: 'tsconfig.json',
      },
      settings: {
        'import/resolver': {
          typescript: {
            project: './',
          },
        },
      },
    },
  ],
  ignorePatterns: ['node_modules', '!.*rc.js', directory.dist],
};
