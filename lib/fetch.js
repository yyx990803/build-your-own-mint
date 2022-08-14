const client = require('./plaidClient')
const { getDefaultStartEndDates } = require('./utils')
const { getAllVenmoTransactions } = require('./venmoClient')

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
  let allPlaidTransactions = rawTransactions.reduce((all, { account, transactions }) => {
    return all.concat(transactions.map(({ name, date, amount, category}) => ({
      account,
      name,
      date,
      amount: -amount,
      category: category.join(),
    })))
  }, [])

  // get venmo transaction data here
  let allVenmoTransactions = await getAllVenmoTransactions()

  return [...allPlaidTransactions, ...allVenmoTransactions]
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
