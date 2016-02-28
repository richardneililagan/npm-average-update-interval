var got = require('got')
var throat = require('throat')

var memoize = require('lodash/memoize')

// :: attempt to remove http socket pooling
require('http').globalAgent.maxSockets = Infinity

// :: limit outgoing HTTP requests to 10 concurrent requests
//    essentially perform the limiting ourselves
module.exports = throat(100, memoize(got))