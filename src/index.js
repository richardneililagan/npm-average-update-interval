require('./target-packages')(150)
  .then(results => {
    console.log(results.length)
    console.log(results[0])
  })