require('dotenv').config()

const { fetchTransactions } = require('./lib/fetch')
const { transformTransactionsToUpdates } = require('./lib/transform')
const { updateSheet, getSheetValues, getNamedRanges } = require('./lib/sheetsCrud')
const { runAudit } = require('./lib/audit')
const { getAllVenmoTransactions } = require('./lib/venmoClient')

const transactionsStartDate = process.env.TRANSACTIONS_START_DATE
const transactionsEndDate = process.env.TRANSACTIONS_END_DATE

const auditStartDate = process.env.AUDIT_START_DATE
const auditEndDate = process.env.AUDIT_END_DATE

;(async () => {
  const transactions = await fetchTransactions(transactionsStartDate, transactionsEndDate)
  const updates = transformTransactionsToUpdates(transactions)

  await updateSheet(updates)

  await runAudit(auditStartDate, auditEndDate)
})()
