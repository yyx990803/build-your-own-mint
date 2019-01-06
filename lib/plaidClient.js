const plaid = require('plaid')

module.exports = new plaid.Client(
  process.env.PLAID_CLIENT_ID,
  process.env.PLAID_SECRET,
  process.env.PLAID_PUBLIC_KEY,
  plaid.environments.development,
  {
    version: '2018-05-22'
  }
)
