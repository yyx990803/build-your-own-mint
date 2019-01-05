const moment = require('moment')
const client = require('./plaidClient')
const creds = require('./credentials.json')

// start from beginning of last month...
const targetMonth = Math.max(1, moment().month() - 1)
const startDate = moment().month(targetMonth - 1).date(1).format('YYYY-MM-DD')
// ends now.
// this ensures we always fully update last month,
// and keep current month up-to-date
const endDate = moment().format('YYYY-MM-DD')

const fetchOptions = [
  startDate,
  endDate,
  {
    count: 250,
    offset: 0
  }
]

exports.fetchTransactions = async function() {
  // fetch in parallel
  const fetchPromises = Object.keys(creds.plaid.tokens).map(accountName => {
    const token = creds.plaid.tokens[accountName]
    return client.getTransactions(token, ...fetchOptions)
      .then(res => ({
        account: accountName,
        transactions: res.transactions
      }))
  })

  const fetchResults = await Promise.all(fetchPromises)

  // concat all transactions
  return fetchResults.reduce((all, { account, transactions }) => {
    return all.concat(transactions.map(({ name, date, amount }) => ({
      // Simplify the format and only keep things we need.
      account,
      name,
      date,
      amount: -amount
    })))
  }, [])
}
