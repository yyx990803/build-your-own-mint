require('dotenv').config()

const { updateSheet } = require('../lib/sheetsCrud')

updateSheet([{
  range: 'testApi!A1',
  values: [['It worked!']]
}])
