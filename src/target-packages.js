var Promise = require('bluebird')
var cheerio = require('cheerio')
var chalk = require('chalk')

var map = require('lodash/map')
var flatten = require('lodash/flatten')

var request = require('./http')
var log = require('./log')

function * generateTask (count) {
  var current = 0
  var increment = 36
  while(current < count) {
    yield `https://www.npmjs.com/browse/star?offset=${ current }`
    current += increment
  }
}

function getNpmPackages (url) {
  return request(url)
    .then(result => {
      var $ = cheerio.load(result.body)
      return map($('.package-details a.name'), item => {
        var element = cheerio(item)
        return {
          name: element.text(),
          url: `https://www.npmjs.com${ element.attr('href') }`
        }
      })
    })
}

function getTargetPackages (count) {

  var tasks = []
  for (var item of generateTask(count)) {
    tasks.push(getNpmPackages(item))
  }

  return Promise.all(tasks)
  .then(results => flatten(results))
  .then(results => results.splice(0, count))
  .catch(err => {
    console.log(chalk.red.bold(err))
  })
}

module.exports = getTargetPackages