require('dotenv').config()

const { updateSheet } = require('../lib/update')

updateSheet([{
  range: 'A1',
  values: [['It worked!']]
}])
