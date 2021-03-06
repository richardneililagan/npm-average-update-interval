'use strict';

var Promise = require('bluebird');
var cheerio = require('cheerio');
var chalk = require('chalk');

var map = require('lodash/map');
var flattenDeep = require('lodash/flattenDeep');

var request = require('./http');
var log = require('./log');

function* generateTask(count) {
  var current = 0;
  var increment = 36;

  while (current < count) {
    yield `https://www.npmjs.com/browse/depended?offset=${ current }`;
    current += increment;
  }
}

function getNpmPackages(url) {
  return request(url).then(function (result) {
    var $ = cheerio.load(result.body);

    return map($('.package-details a.name'), function (item) {
      var element = cheerio(item);

      return {
        name: element.text(),
        url: `https://www.npmjs.com${ element.attr('href') }`
      };
    });
  });
}

function getNpmPackageDetails(url) {
  return request(url).then(function (result) {
    var $ = cheerio.load(result.body);
    var githubLink = $('.sidebar ul.box:nth-child(3) li:nth-child(3) a').attr('href');

    return githubLink ? {
      github_user: githubLink.split('/')[3],
      github_repo: githubLink.split('/')[4]
    } : null;
  });
}

function getTargetPackages(count) {
  var tasks = [];
  for (var item of generateTask(count)) {
    tasks.push(getNpmPackages(item));
  }

  return Promise.all(tasks).then(function (results) {
    return flattenDeep(results);
  }).then(function (results) {
    return results.splice(0, count);
  }).then(function (results) {
    return Promise.all(map(results, function (item) {
      item.__task = log.add(chalk.bold.green(`npm :: ${ item.name }`)).status('Preparing').details('Getting Github details');

      return getNpmPackageDetails(item.url).then(function (result) {
        return Object.assign(item, result);
      }).then(function (_) {
        var itemtask = item.__task;
        if (item.github_user) {
          itemtask.status('Analyzing').details(chalk.bold.cyan(`${ item.github_user }/${ item.github_repo }`));
        } else {
          itemtask.done(chalk.bold.red('Invalid'));
        }

        return item;
      });
    }));
  }).catch(function (err) {
    console.log(chalk.red.bold(err));
  });
}

module.exports = getTargetPackages;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy90YXJnZXQtcGFja2FnZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJLFVBQVUsUUFBUSxVQUFSLENBQVY7QUFDSixJQUFJLFVBQVUsUUFBUSxTQUFSLENBQVY7QUFDSixJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVI7O0FBRUosSUFBSSxNQUFNLFFBQVEsWUFBUixDQUFOO0FBQ0osSUFBSSxjQUFjLFFBQVEsb0JBQVIsQ0FBZDs7QUFFSixJQUFJLFVBQVUsUUFBUSxRQUFSLENBQVY7QUFDSixJQUFJLE1BQU0sUUFBUSxPQUFSLENBQU47O0FBRUosVUFBVyxZQUFYLENBQXlCLEtBQXpCLEVBQWdDO0FBQzlCLE1BQUksVUFBVSxDQUFWLENBRDBCO0FBRTlCLE1BQUksWUFBWSxFQUFaLENBRjBCOztBQUk5QixTQUFPLFVBQVUsS0FBVixFQUFpQjtBQUN0QixVQUFNLENBQUMsNkNBQUQsR0FBaUQsT0FBakQsRUFBMEQsQ0FBaEUsQ0FEc0I7QUFFdEIsZUFBVyxTQUFYLENBRnNCO0dBQXhCO0NBSkY7O0FBVUEsU0FBUyxjQUFULENBQXlCLEdBQXpCLEVBQThCO0FBQzVCLFNBQU8sUUFBUSxHQUFSLEVBQ0osSUFESSxDQUNDLGtCQUFVO0FBQ2QsUUFBSSxJQUFJLFFBQVEsSUFBUixDQUFhLE9BQU8sSUFBUCxDQUFqQixDQURVOztBQUdkLFdBQU8sSUFBSSxFQUFFLHlCQUFGLENBQUosRUFBa0MsZ0JBQVE7QUFDL0MsVUFBSSxVQUFVLFFBQVEsSUFBUixDQUFWLENBRDJDOztBQUcvQyxhQUFPO0FBQ0wsY0FBTSxRQUFRLElBQVIsRUFBTjtBQUNBLGFBQUssQ0FBQyxxQkFBRCxHQUF5QixRQUFRLElBQVIsQ0FBYSxNQUFiLENBQXpCLEVBQStDLENBQXBEO09BRkYsQ0FIK0M7S0FBUixDQUF6QyxDQUhjO0dBQVYsQ0FEUixDQUQ0QjtDQUE5Qjs7QUFnQkEsU0FBUyxvQkFBVCxDQUErQixHQUEvQixFQUFvQztBQUNsQyxTQUFPLFFBQVEsR0FBUixFQUNKLElBREksQ0FDQyxrQkFBVTtBQUNkLFFBQUksSUFBSSxRQUFRLElBQVIsQ0FBYSxPQUFPLElBQVAsQ0FBakIsQ0FEVTtBQUVkLFFBQUksYUFBYSxFQUFFLGdEQUFGLEVBQW9ELElBQXBELENBQXlELE1BQXpELENBQWIsQ0FGVTs7QUFJZCxXQUFPLGFBQ0g7QUFDQSxtQkFBYSxXQUFXLEtBQVgsQ0FBaUIsR0FBakIsRUFBc0IsQ0FBdEIsQ0FBYjtBQUNBLG1CQUFhLFdBQVcsS0FBWCxDQUFpQixHQUFqQixFQUFzQixDQUF0QixDQUFiO0tBSEcsR0FLSCxJQUxHLENBSk87R0FBVixDQURSLENBRGtDO0NBQXBDOztBQWVBLFNBQVMsaUJBQVQsQ0FBNEIsS0FBNUIsRUFBbUM7QUFDakMsTUFBSSxRQUFRLEVBQVIsQ0FENkI7QUFFakMsT0FBSyxJQUFJLElBQUosSUFBWSxhQUFhLEtBQWIsQ0FBakIsRUFBc0M7QUFDcEMsVUFBTSxJQUFOLENBQVcsZUFBZSxJQUFmLENBQVgsRUFEb0M7R0FBdEM7O0FBSUEsU0FBTyxRQUFRLEdBQVIsQ0FBWSxLQUFaLEVBQ04sSUFETSxDQUNEO1dBQVcsWUFBWSxPQUFaO0dBQVgsQ0FEQyxDQUVOLElBRk0sQ0FFRDtXQUFXLFFBQVEsTUFBUixDQUFlLENBQWYsRUFBa0IsS0FBbEI7R0FBWCxDQUZDLENBR04sSUFITSxDQUdELG1CQUFXO0FBQ2YsV0FBTyxRQUFRLEdBQVIsQ0FBWSxJQUFJLE9BQUosRUFBYSxnQkFBUTtBQUN0QyxXQUFLLE1BQUwsR0FBYyxJQUFJLEdBQUosQ0FBUSxNQUFNLElBQU4sQ0FBVyxLQUFYLENBQWlCLENBQUMsT0FBRCxHQUFXLEtBQUssSUFBTCxFQUFXLENBQXZDLENBQVIsRUFDWCxNQURXLENBQ0osV0FESSxFQUVYLE9BRlcsQ0FFSCx3QkFGRyxDQUFkLENBRHNDOztBQUt0QyxhQUFPLHFCQUFxQixLQUFLLEdBQUwsQ0FBckIsQ0FDSixJQURJLENBQ0M7ZUFBVSxPQUFPLE1BQVAsQ0FBYyxJQUFkLEVBQW9CLE1BQXBCO09BQVYsQ0FERCxDQUVKLElBRkksQ0FFQyxhQUFLO0FBQ1QsWUFBSSxXQUFXLEtBQUssTUFBTCxDQUROO0FBRVQsWUFBSSxLQUFLLFdBQUwsRUFBa0I7QUFDcEIsbUJBQ0csTUFESCxDQUNVLFdBRFYsRUFFRyxPQUZILENBRVcsTUFBTSxJQUFOLENBQVcsSUFBWCxDQUFnQixDQUFDLEdBQUcsS0FBSyxXQUFMLEVBQWtCLENBQXRCLEdBQTBCLEtBQUssV0FBTCxFQUFrQixDQUE1RCxDQUZYLEVBRG9CO1NBQXRCLE1BSU87QUFDTCxtQkFBUyxJQUFULENBQWMsTUFBTSxJQUFOLENBQVcsR0FBWCxDQUFlLFNBQWYsQ0FBZCxFQURLO1NBSlA7O0FBUUEsZUFBTyxJQUFQLENBVlM7T0FBTCxDQUZSLENBTHNDO0tBQVIsQ0FBekIsQ0FBUCxDQURlO0dBQVgsQ0FIQyxDQXlCTixLQXpCTSxDQXlCQSxlQUFPO0FBQ1osWUFBUSxHQUFSLENBQVksTUFBTSxHQUFOLENBQVUsSUFBVixDQUFlLEdBQWYsQ0FBWixFQURZO0dBQVAsQ0F6QlAsQ0FOaUM7Q0FBbkM7O0FBb0NBLE9BQU8sT0FBUCxHQUFpQixpQkFBakIiLCJmaWxlIjoidGFyZ2V0LXBhY2thZ2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpXHJcbnZhciBjaGVlcmlvID0gcmVxdWlyZSgnY2hlZXJpbycpXHJcbnZhciBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcclxuXHJcbnZhciBtYXAgPSByZXF1aXJlKCdsb2Rhc2gvbWFwJylcclxudmFyIGZsYXR0ZW5EZWVwID0gcmVxdWlyZSgnbG9kYXNoL2ZsYXR0ZW5EZWVwJylcclxuXHJcbnZhciByZXF1ZXN0ID0gcmVxdWlyZSgnLi9odHRwJylcclxudmFyIGxvZyA9IHJlcXVpcmUoJy4vbG9nJylcclxuXHJcbmZ1bmN0aW9uICogZ2VuZXJhdGVUYXNrIChjb3VudCkge1xyXG4gIHZhciBjdXJyZW50ID0gMFxyXG4gIHZhciBpbmNyZW1lbnQgPSAzNlxyXG5cclxuICB3aGlsZSAoY3VycmVudCA8IGNvdW50KSB7XHJcbiAgICB5aWVsZCBgaHR0cHM6Ly93d3cubnBtanMuY29tL2Jyb3dzZS9kZXBlbmRlZD9vZmZzZXQ9JHsgY3VycmVudCB9YFxyXG4gICAgY3VycmVudCArPSBpbmNyZW1lbnRcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE5wbVBhY2thZ2VzICh1cmwpIHtcclxuICByZXR1cm4gcmVxdWVzdCh1cmwpXHJcbiAgICAudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICB2YXIgJCA9IGNoZWVyaW8ubG9hZChyZXN1bHQuYm9keSlcclxuXHJcbiAgICAgIHJldHVybiBtYXAoJCgnLnBhY2thZ2UtZGV0YWlscyBhLm5hbWUnKSwgaXRlbSA9PiB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBjaGVlcmlvKGl0ZW0pXHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lOiBlbGVtZW50LnRleHQoKSxcclxuICAgICAgICAgIHVybDogYGh0dHBzOi8vd3d3Lm5wbWpzLmNvbSR7IGVsZW1lbnQuYXR0cignaHJlZicpIH1gXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TnBtUGFja2FnZURldGFpbHMgKHVybCkge1xyXG4gIHJldHVybiByZXF1ZXN0KHVybClcclxuICAgIC50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgIHZhciAkID0gY2hlZXJpby5sb2FkKHJlc3VsdC5ib2R5KVxyXG4gICAgICB2YXIgZ2l0aHViTGluayA9ICQoJy5zaWRlYmFyIHVsLmJveDpudGgtY2hpbGQoMykgbGk6bnRoLWNoaWxkKDMpIGEnKS5hdHRyKCdocmVmJylcclxuXHJcbiAgICAgIHJldHVybiBnaXRodWJMaW5rXHJcbiAgICAgICAgPyB7XHJcbiAgICAgICAgICBnaXRodWJfdXNlcjogZ2l0aHViTGluay5zcGxpdCgnLycpWzNdLFxyXG4gICAgICAgICAgZ2l0aHViX3JlcG86IGdpdGh1Ykxpbmsuc3BsaXQoJy8nKVs0XVxyXG4gICAgICAgIH1cclxuICAgICAgICA6IG51bGxcclxuICAgIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRhcmdldFBhY2thZ2VzIChjb3VudCkge1xyXG4gIHZhciB0YXNrcyA9IFtdXHJcbiAgZm9yICh2YXIgaXRlbSBvZiBnZW5lcmF0ZVRhc2soY291bnQpKSB7XHJcbiAgICB0YXNrcy5wdXNoKGdldE5wbVBhY2thZ2VzKGl0ZW0pKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIFByb21pc2UuYWxsKHRhc2tzKVxyXG4gIC50aGVuKHJlc3VsdHMgPT4gZmxhdHRlbkRlZXAocmVzdWx0cykpXHJcbiAgLnRoZW4ocmVzdWx0cyA9PiByZXN1bHRzLnNwbGljZSgwLCBjb3VudCkpXHJcbiAgLnRoZW4ocmVzdWx0cyA9PiB7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwobWFwKHJlc3VsdHMsIGl0ZW0gPT4ge1xyXG4gICAgICBpdGVtLl9fdGFzayA9IGxvZy5hZGQoY2hhbGsuYm9sZC5ncmVlbihgbnBtIDo6ICR7IGl0ZW0ubmFtZSB9YCkpXHJcbiAgICAgICAgLnN0YXR1cygnUHJlcGFyaW5nJylcclxuICAgICAgICAuZGV0YWlscygnR2V0dGluZyBHaXRodWIgZGV0YWlscycpXHJcblxyXG4gICAgICByZXR1cm4gZ2V0TnBtUGFja2FnZURldGFpbHMoaXRlbS51cmwpXHJcbiAgICAgICAgLnRoZW4ocmVzdWx0ID0+IE9iamVjdC5hc3NpZ24oaXRlbSwgcmVzdWx0KSlcclxuICAgICAgICAudGhlbihfID0+IHtcclxuICAgICAgICAgIHZhciBpdGVtdGFzayA9IGl0ZW0uX190YXNrXHJcbiAgICAgICAgICBpZiAoaXRlbS5naXRodWJfdXNlcikge1xyXG4gICAgICAgICAgICBpdGVtdGFza1xyXG4gICAgICAgICAgICAgIC5zdGF0dXMoJ0FuYWx5emluZycpXHJcbiAgICAgICAgICAgICAgLmRldGFpbHMoY2hhbGsuYm9sZC5jeWFuKGAkeyBpdGVtLmdpdGh1Yl91c2VyIH0vJHsgaXRlbS5naXRodWJfcmVwbyB9YCkpXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpdGVtdGFzay5kb25lKGNoYWxrLmJvbGQucmVkKCdJbnZhbGlkJykpXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGl0ZW1cclxuICAgICAgICB9KVxyXG4gICAgfSkpXHJcbiAgfSlcclxuICAuY2F0Y2goZXJyID0+IHtcclxuICAgIGNvbnNvbGUubG9nKGNoYWxrLnJlZC5ib2xkKGVycikpXHJcbiAgfSlcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnZXRUYXJnZXRQYWNrYWdlc1xyXG4iXX0=