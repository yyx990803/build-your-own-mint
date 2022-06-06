require('dotenv').config()

const { updateSheet } = require('../lib/sheetsCrud')

updateSheet([{
  range: 'A1',
  values: [['It worked!']]
}])
