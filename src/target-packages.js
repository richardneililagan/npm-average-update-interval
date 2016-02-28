var Promise = require('bluebird')
var cheerio = require('cheerio')
var chalk = require('chalk')

var map = require('lodash/map')
var flatten = require('lodash/flattenDeep')

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
      return Promise.all(map($('.package-details a.name'), item => {
        var element = cheerio(item)
        var packageDetailsUrl = `https://www.npmjs.com${ element.attr('href') }`

        return request(packageDetailsUrl)
          .then(result => {
            var $ = cheerio.load(result.body)
            var githubLink = $('.sidebar ul.box:first li:nth-child(3) a').attr('href')

            return {
              name: element.text(),
              url: packageDetailsUrl,
              github_user: githubLink.split('/')[3],
              github_repo: githubLink.split('/')[4]
            }
          })
      }))
    })
}

function getTargetPackages (count) {

  var tasks = []
  for (var item of generateTask(count)) {
    tasks.push(getNpmPackages(item))
  }

  return Promise.all(tasks)
  .then(results => flattenDeep(results))
  .then(results => results.splice(0, count))
  .catch(err => {
    console.log(chalk.red.bold(err))
  })
}

module.exports = getTargetPackages