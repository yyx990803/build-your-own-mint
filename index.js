require('dotenv').config()

const { fetchTransactions } = require('./lib/fetch')
const { transformTransactionsToUpdates } = require('./lib/transform')
const { updateSheet, getSheetValues, getNamedRanges } = require('./lib/sheetsCrud')
const { runAudit } = require('./lib/audit')

;(async () => {

  const transactions = await fetchTransactions('2021-01-01') // read this startDate from json config.
  const updates = transformTransactionsToUpdates(transactions)
  updateSheet(updates)
  await runAudit('2022-01-01') // TO DO get this date from config
})()
