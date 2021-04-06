require('dotenv-safe').config()
require = require('esm')(module)
module.exports = require('./bin/www')
