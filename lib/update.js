const { google } = require('googleapis')
const creds = require('./credentials.json')
const moment = require('moment')
const oAuth2Client = require('./googleClient')

oAuth2Client.setCredentials(creds.sheets.token)

const sheets = google.sheets({
  version: 'v4',
  auth: oAuth2Client
})

exports.updateSheet = async function(updates) {
  sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: creds.sheets.sheet_id,
    resource: {
      valueInputOption: `USER_ENTERED`,
      data: updates.map(p => ({
        range: p.range,
        values: [[p.value]]
      }))
    }
  }, (err, res) => {
    if (err) {
      return console.log('Update failed: ', err)
    }
    console.log(`Success! ${res.data.totalUpdatedCells} cells updated.`)
  })
}
