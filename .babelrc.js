/**
 * Babel configuration
 * https://babeljs.io
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: 3,
        debug: false
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: ['@babel/plugin-proposal-class-properties']
}
