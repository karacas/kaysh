
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./kaysh.cjs.production.min.js')
} else {
  module.exports = require('./kaysh.cjs.development.js')
}
