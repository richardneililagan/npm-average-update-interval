var chalk = require('chalk')
var observatory = require('observatory').settings({
  prefix: chalk.bold.yellow('[request-stats] ')
})

module.exports = observatory
