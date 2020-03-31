/**
 * Postcss Configuration
 * @see https://postcss.org
 */

const autoprefixer = require('autoprefixer')
const flexbugsFixes = require('postcss-flexbugs-fixes')
const cssnano = require('cssnano')

const { svgoOptions } = require('./config')

module.exports = {
  plugins: [
    flexbugsFixes(),
    autoprefixer(),
    cssnano({
      preset: [
        'default',
        {
          calc: false,
          reduceInitial: false,
          svgo: svgoOptions,
        },
      ],
    }),
  ],
}
