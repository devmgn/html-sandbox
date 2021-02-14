/**
 * Stylelint configuration
 * @see https://stylelint.io
 */

module.exports = {
  extends: ['stylelint-config-recommended-scss', 'stylelint-prettier/recommended', 'stylelint-config-rational-order'],
  rules: {
    // Limit language features
    'length-zero-no-unit': true,
    // Stylistic issues
    'function-name-case': 'lower',
    'function-url-quotes': 'never',
    'shorthand-property-no-redundant-values': true,
    'declaration-block-no-redundant-longhand-properties': true,
    'selector-pseudo-element-colon-notation': 'double',
    'value-keyword-case': 'lower',
    'selector-type-case': 'lower',
    // stylelint-scss
    'scss/at-mixin-argumentless-call-parentheses': 'never',
    'scss/at-rule-conditional-no-parentheses': true,
    'scss/dimension-no-non-numeric-values': true,
    'scss/no-duplicate-mixins': true,
    'scss/no-global-function-names': true,
    // stylelint-order
    'order/order': ['dollar-variables', 'custom-properties', 'declarations', 'rules', 'at-rules'],
  },
};
