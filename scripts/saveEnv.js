const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const envPath = path.resolve(__dirname, '../.env')

module.exports = function(vars) {
  let current
  try {
    current = dotenv.parse(fs.readFileSync(envPath))
  } catch (e) {
    current = {}
  }
  Object.assign(current, vars)
  const serlized = Object.keys(current)
    .map(key => `${key}=${current[key]}`)
    .join(`\n`)
  fs.writeFileSync(envPath, serlized)
}
