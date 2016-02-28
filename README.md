npm-average-update-interval
===========================

This app attempts to figure out how long (on average) [npm](https://npmjs.org) packages are
updated, over a set time period.

The current version is hard-coded to check for the **50 most depended on**
npm packages, over **the last 30 days**.

> **Note:** Really hastily coded, and can be improved at many, many places.

## Todo

- [ ] Find a better way to not hit Github rate limiting
- [ ] Improve the promise flow. Better if bulk promises are not waiting on each other.
- [ ] Maybe set up a `gh-pages` branch, to show results
- [ ] Add proper CLI hooks, for when calling from the CLI. See `meow`.
- [ ] Make the number of packages queries configurable.
- [ ] Make the timeframe configurable. Better if we can set an arbitrary range.
- [ ] Improve the checking of tags. Substantial improvement if the app doesn't query details for every tag it gets.
- [ ] On that topic, Github seems to limit results to 30 when querying for tags from a repo. Make sure we're considering every tag that should be considered despite that.

## Motivation

I wanted to figure out how fast the development landscape was changing.
As developers, we all talk about staying current with our tools, and keeping
on top of recent trends.

This app comes from the POV that a developer / project / team will have multiple
packages from which their respective solutions depend on. If any of those packages
update, then this app treats that as a need to update oneself, no matter how small.

By calculating the average across a number of projects, I hoped to mimic just how
fast it was to drop out of *current status* across a single developer's knowledge base.

## Methodology

This app calculates the metrics it needs by:

1. Getting the **most depended on packages** from npm.
2. Figuring out their Github repository URLs.
3. Getting the tags defined in their Git repos. We assume that these are npm release material.
4. Figure out when these tags were pushed to the repo. We do this by getting the associated commit for each tag, and querying for the date it was authored.
5. Count all the tags that were committed within the specified timeframe.
6. From there, it's all a matter of simple averages.

> (Valid tags within time frame) / (Time frame) = (Average Time Frame between significant changes)

## Usage

1. Clone this repository. This app uses **nodejs** -- make sure you have it installed.
2. Run `npm install` to get app dependencies (heh).
3. `npm start`