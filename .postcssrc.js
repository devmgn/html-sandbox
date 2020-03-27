/**
 * Postcss Configuration
 * @see https://postcss.org
 */

/**
 * Autoprefixer
 * @see https://github.com/postcss/autoprefixer
 */
const autoprefixer = require('autoprefixer')

/**
 * PostCSS Flexbugs Fixes
 * @see https://github.com/luisrudge/postcss-flexbugs-fixes
 */
const flexbugsFixes = require('postcss-flexbugs-fixes')

/**
 * cssnano
 * @see https://cssnano.co
 */
const cssnano = require('cssnano')

const { svgoOptions } = require('./config')

module.exports = {
  plugins: [
    flexbugsFixes(),
    autoprefixer(),
    cssnano({
      preset: ['default', { calc: false, reduceInitial: false, svgo: svgoOptions }],
    }),
  ],
}
