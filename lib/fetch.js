const moment = require('moment')
const client = require('./plaidClient')

// start from beginning of last month...
const startDate = moment()
  .subtract(1, 'month')
  .startOf('month')
  .format('YYYY-MM-DD');
// ends now.
// this ensures we always fully update last month,
// and keep current month up-to-date
const endDate = moment().format('YYYY-MM-DD')

const transactionFetchOptions = [
  startDate,
  endDate,
  {
    count: 250,
    offset: 0
  }
]

const plaidAccountTokens = Object.keys(process.env)
  .filter(key => key.startsWith(`PLAID_TOKEN`))
  .map(key => ({
    account: key.replace(/^PLAID_TOKEN_/, ''),
    token: process.env[key]
  }))

exports.fetchTransactions = async function() {
  const rawTransactions = await Promise.all(plaidAccountTokens.map(({ account, token }) => {
    return client.getTransactions(token, ...transactionFetchOptions)
      .then(({ transactions }) => ({
        account,
        transactions
      }))
  }))

  // concat all transactions
  return rawTransactions.reduce((all, { account, transactions }) => {
    return all.concat(transactions.map(({ name, date, amount }) => ({
      account,
      name,
      date,
      amount: -amount,
      category,
    })))
  }, [])
}

exports.fetchBalances = async function() {
  const rawBalances = await Promise.all(plaidAccountTokens.map(({ account, token }) => {
    return client.getBalance(token)
  }))

  return rawBalances.reduce((all, { accounts }) => {
    return all.concat(accounts.map(({ name, balances }) => ({
      name,
      balance: balances.current
    })))
  }, [])
}
