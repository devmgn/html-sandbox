/**
 * Husky configuration
 * @see https://github.com/typicode/husky
 */

module.exports = {
  hooks: {
    'pre-commit': 'lint-staged',
  },
}
