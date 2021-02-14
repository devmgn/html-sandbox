/**
 * Postcss Configuration
 * @see https://postcss.org
 */

/* eslint-disable import/no-extraneous-dependencies */
const autoprefixer = require('autoprefixer');
const postcssSortMediaQueries = require('postcss-sort-media-queries');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssObjectFitImages = require('postcss-object-fit-images');
const cssnano = require('cssnano');

const { svgoOptions } = require('./config');

module.exports = {
  plugins: [
    postcssSortMediaQueries(),
    postcssFlexbugsFixes(),
    postcssObjectFitImages(),
    autoprefixer({
      grid: true,
    }),
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
};
