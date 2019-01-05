const { google } = require('googleapis')
const creds = require('./credentials.json')

module.exports = new google.auth.OAuth2(
  creds.sheets.client_id,
  creds.sheets.client_secret,
  creds.sheets.redirect_uris[0]
)
