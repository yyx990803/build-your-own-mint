require('dotenv').config()

const { fetchTransactions } = require('./lib/fetch')
const { transformTransactionsToUpdates } = require('./lib/transform')
const { updateSheet } = require('./lib/update')

;(async () => {
  const transactions = await fetchTransactions('2021-01-01') // read this startDate from json config.
  const updates = transformTransactionsToUpdates(transactions)
  updateSheet(updates)
})()
