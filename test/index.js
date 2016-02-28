var test = require('tape')

// :: begin tests
test('JS Standard Format compliance', require('tape-eslint')({
  files: ['src/**/*.js']
}))
