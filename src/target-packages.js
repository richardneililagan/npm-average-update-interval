var Promise = require('bluebird')
var cheerio = require('cheerio')
var chalk = require('chalk')

var map = require('lodash/map')
var flattenDeep = require('lodash/flattenDeep')

var request = require('./http')
var log = require('./log')

function * generateTask (count) {
  var current = 0
  var increment = 36
  while(current < count) {
    yield `https://www.npmjs.com/browse/depended?offset=${ current }`
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
          url: `https://www.npmjs.com${ element.attr('href') }`,
        }
      })
    })
}

function getNpmPackageDetails (url) {
  return request(url)
    .then(result => {
      var $ = cheerio.load(result.body)
      var githubLink = $('.sidebar ul.box:nth-child(3) li:nth-child(3) a').attr('href')

      return githubLink
        ? {
          github_user: githubLink.split('/')[3],
          github_repo: githubLink.split('/')[4]
        }
        : null
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
  .then(results => {
    return Promise.all(map(results, item => {
      item.__task = log.add(chalk.bold.green(`npm :: ${ item.name }`))
        .status('Preparing')
        .details('Getting Github details')

      return getNpmPackageDetails(item.url)
        .then(result => Object.assign(item, result))
        .then(result => {
          var itemtask = item.__task
          if (item.github_user) {
            itemtask
              .status('Analyzing')
              .details(chalk.bold.cyan(`${ item.github_user }/${ item.github_repo }`))
          }
          else {
            itemtask.done(chalk.bold.red('Invalid'))
          }

          return item
        })
    }))
  })
  .catch(err => {
    console.log(chalk.red.bold(err))
  })
}

module.exports = getTargetPackages