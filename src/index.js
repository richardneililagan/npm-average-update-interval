var Promise = require('bluebird')
var moment = require('moment')
var chalk = require('chalk')

var map = require('lodash/map')
var compact = require('lodash/compact')
var reduce = require('lodash/reduce')

var request = require('./http')
var config = require('./config')
var log = require('./log')

// let's do this shit
var targetCount = 5
var targetDays = 30     // last 30 days

var startingDate = +(moment().add(-targetDays, 'days'))
console.log(startingDate)

var task = log.add('Query npm for starred packages')
  .status('Querying')
  .details(`Getting ${ targetCount } packages`)

require('./target-packages')(targetCount)
  .then(results => {
    var percentSuccess = ~~(results.length / targetCount * 100)
    task.done().details(`[${ percentSuccess }%] ${ results.length } packages found.`)

    var githubDetailsTasks = map(results, item => {
      return request(
        `https://api.github.com/repos/${ item.github_user }/${ item.github_repo }/tags`,
        {
          auth: `${ config.github_username }:${ config.github_accesstoken }`
        })
        .then(result => {
          item.tags = JSON.parse(result.body)
          item.__task.details(`${ item.tags.length } tags found`)
          return item
        })
        .then(result => {
          return Promise.all(map(item.tags, tag => {
            return request(`https://api.github.com/repos/${ item.github_user }/${ item.github_repo }/git/commits/${ tag.commit.sha }`, {
              auth: `${ config.github_username }:${ config.github_accesstoken }`
            })
            .then(response => {
              var res = JSON.parse(response.body)
              var dateCommitted = +moment(res.committer.date)
              return dateCommitted > startingDate
            })
          }))
        })
        .then(result => compact(result))
        .then(result => {
          item.recentChanges = result.length
          item.__task.done().details(chalk.bold.cyan(`${ result.length } recent changes`))

          return item
        })
        .catch(err => {
          console.log(err)
        })
    })

    return Promise.all(githubDetailsTasks)
  })
  .then(results => {
    var totalChanges = reduce(results, (sum, item) => {
      return sum + item.recentChanges
    }, 0)

    var targetSeconds = targetDays * 24 * 60 * 60

    console.log('\n' + `${ totalChanges } total changes in the last ${ targetSeconds } seconds over ${ results.length } packages.`)
    console.log(`On average, a change occurs in ${ chalk.bold.green(~~(targetSeconds / totalChanges) + ' seconds') }.`)
  })