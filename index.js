require('dotenv').config()

const { fetchTransactions } = require('./lib/fetch')
const { transformTransactionsToUpdates } = require('./lib/transform')
const { updateSheet, getSheetValues, getNamedRanges } = require('./lib/sheetsCrud')
const { runAudit } = require('./lib/audit')
const { getAllTransactions } = require('./lib/venmoClient')

const transactionsStartDate = process.env.TRANSACTIONS_START_DATE
const transactionsEndDate = process.env.TRANSACTIONS_END_DATE

const auditStartDate = process.env.AUDIT_START_DATE
const auditEndDate = process.env.AUDIT_END_DATE

;(async () => {
  // const transactions = await fetchTransactions(transactionsStartDate, transactionsEndDate)
  // const updates = transformTransactionsToUpdates(transactions)
  // await updateSheet([{ range: 'testApi!A1:A3', values: [[6],[6],[9]]}])
  // await updateSheet([{ range: 'testApi!B1', values: [['=UNIQUE(A1:A3)']]}])
  // await updateSheet([{ range: 'testApi!B2', values: [['abc']]}])
  const res = await getSheetValues(['testApi'])
  console.log(JSON.stringify(res, null, 2))
  // updateSheet([{
  //   range: 'testApi!A1',
  //   values: [['It worked!']]
  // }])

  // await runAudit(auditStartDate, auditEndDate)
  // let transactions = await getAllTransactions()
  // console.log(transactions)
})()
