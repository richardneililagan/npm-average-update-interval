var chalk = require('chalk')

var isNull = require('lodash/isNull')
var isUndefined = require('lodash/isUndefined')

var config = {}

function requireEnv (name) {
  var val = process.env[name]
  if (isUndefined(val) || isNull(val)) {
    throw new Error(chalk.bold.red(`ERROR : Required environment variable ${ chalk.bold.yellow(name) } is not set.`))
  }

  return val
}

config.github_username = requireEnv('NPMSTATS_GITHUB_USERNAME')
config.github_accesstoken = requireEnv('NPMSTATS_GITHUB_TOKEN')

module.exports = config
