const loggerFactory = require('easy-log')

module.exports.debugLog = loggerFactory('app:debug')
module.exports.serverLog = loggerFactory('app:server')

module.exports.requestLog = (req, res, next) => {
  let log = `${req.method} - ${req.originalUrl}`
  loggerFactory('app:request', { colorCode: 226 })(log)
  return next()
}