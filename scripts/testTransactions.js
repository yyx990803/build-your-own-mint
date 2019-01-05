const path = require('path')
const { writeFile } = require('fs-extra')
const { fetchTransactions } = require('../lib/fetch')

;(async () => {
  const res = await fetchTransactions()
  await writeFile(
    path.resolve(__dirname, '../transactions.json'),
    JSON.stringify(res, null, 2)
  )
})()
