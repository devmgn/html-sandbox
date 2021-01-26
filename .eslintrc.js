/**
 * ESLint configuration
 * @see https://eslint.org
 */

const { directory } = require('./config');

module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    'jest/globals': true,
  },
  extends: ['airbnb', 'airbnb/hooks', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
  plugins: ['prettier', 'react', 'jest'],
  parserOptions: {
    sourceType: 'module',
    project: 'tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    'import/resolver': {
      typescript: {
        config: 'webpack.config.js',
      },
    },
  },
  rules: {
    'no-console': [
      'error',
      {
        allow: ['error', 'warn'],
      },
    ],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
      },
    ],
    'react/jsx-uses-vars': 1,
    'react/jsx-uses-react': 1,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      { js: 'never', jsx: 'never', ts: 'never', tsx: 'never', json: 'never' },
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
};
