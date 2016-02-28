var got = require('got')
var throat = require('throat')

var memoize = require('lodash/memoize')

// :: limit outgoing HTTP requests to 10 concurrent requests
module.exports = throat(10, memoize(got))