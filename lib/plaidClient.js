const plaid = require('plaid')
const creds = require('./credentials.json')

module.exports = new plaid.Client(
  creds.plaid.client_id,
  creds.plaid.secret,
  creds.plaid.public_key,
  plaid.environments.development,
  {
    version: '2018-05-22'
  }
)
