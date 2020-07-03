const async = require('async')

module.exports = function loaderCommons (queries, callback) {
  async.concat(queries,
    (query, done) => {
      let k = Object.keys(query)
      global.fetch('commons.cgi?' + k + '=' + encodeURIComponent(query[k]))
        .then(res => res.json())
        .then(body => {
          done(null, body)
        })
        .catch(e => done(e))
    },
    (err, result) => {
      async.setImmediate(() => callback(err, result))
    }
  )
}
