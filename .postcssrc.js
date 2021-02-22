/**
 * Postcss Configuration
 * @see https://postcss.org
 */

/* eslint-disable import/no-extraneous-dependencies */
const autoprefixer = require('autoprefixer');
const postcssSortMediaQueries = require('postcss-sort-media-queries');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssObjectFitImages = require('postcss-object-fit-images');

module.exports = {
  plugins: [postcssSortMediaQueries(), postcssFlexbugsFixes(), postcssObjectFitImages(), autoprefixer({ grid: true })],
};
