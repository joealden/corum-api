// For more info, visit https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: { node: true },
  extends: 'standard',
  rules: {
    semi: 0,
    'prefer-promise-reject-errors': 0,
    'space-before-function-paren': 0,
    // allow optionalDependencies
    'import/no-extraneous-dependencies': [
      0,
      {
        optionalDependencies: ['test/unit/index.js']
      }
    ]
  }
}
