/**
 * Postcss Configuration
 * https://postcss.org
 */

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const autoprefixer = require('autoprefixer')
const flexbugsFixes = require('postcss-flexbugs-fixes')
const cssnano = require('cssnano')

module.exports = {
  plugins: [
    flexbugsFixes(),
    autoprefixer(),
    cssnano({
      preset: [
        'default',
        {
          calc: false,
          reduceInitial: false
        }
      ]
    })
  ]
}
