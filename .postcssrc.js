/**
 * Postcss Configuration
 * @see https://postcss.org
 */

/* eslint-disable import/no-extraneous-dependencies */
const autoprefixer = require('autoprefixer');
const postcssSortMediaQueries = require('postcss-sort-media-queries');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postcssObjectFitImages = require('postcss-object-fit-images');
const postcssSelectorNot = require('postcss-selector-not').default;

module.exports = {
  plugins: [
    postcssSortMediaQueries(),
    postcssFlexbugsFixes(),
    postcssObjectFitImages(),
    postcssSelectorNot(),
    autoprefixer({ grid: true }),
  ],
};
