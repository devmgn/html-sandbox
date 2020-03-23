/**
 * lint-staged configuration
 * @see https://github.com/okonet/lint-staged
 */

module.exports = {
  '**/*.ts?(x)': ['yarn lint', 'tsc'],
  '**/*.js?(x)': ['yarn lint'],
}
