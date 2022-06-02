const moment = require('moment')
const client = require('./plaidClient')

const getDefaultStartEndDates = () => {
  // start from beginning of last month...
  const startDate = moment()
      .subtract(3, 'month')
      .startOf('month')
      .format('YYYY-MM-DD');
// ends now.
// this ensures we always fully update last month,
// and keep current month up-to-date
  const endDate = moment().format('YYYY-MM-DD')

  return { startDate, endDate }
}

const plaidAccountTokens = Object.keys(process.env)
  .filter(key => key.startsWith(`PLAID_TOKEN`))
  .map(key => ({
    account: key.replace(/^PLAID_TOKEN_/, ''),
    token: process.env[key]
  }))

// add venmo integration here to fetch transactions and make it accept start and end timestamps
exports.fetchTransactions = async function(startDate, endDate) {

  const start = startDate || getDefaultStartEndDates().startDate;
  const end = endDate || getDefaultStartEndDates().endDate;

  const rawTransactions = await Promise.all(plaidAccountTokens.map(({ account, token }) => {
    return client.getAllTransactions(token, start, end)
      .then((transactions) => ({
        account,
        transactions
      }))
  }))

  // concat all transactions
  return rawTransactions.reduce((all, { account, transactions }) => {
    return all.concat(transactions.map(({ name, date, amount, category}) => ({
      account,
      name,
      date,
      amount: -amount,
      category: category.join(),
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
