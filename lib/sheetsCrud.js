const { google } = require('googleapis')
const oAuth2Client = require('./googleClient')

oAuth2Client.setCredentials({
  access_token: process.env.SHEETS_ACCESS_TOKEN,
  refresh_token: process.env.SHEETS_REFRESH_TOKEN,
  scope: process.env.SHEETS_SCOPE,
  token_type: process.env.SHEETS_TOKEN_TYPE,
  expiry_date: process.env.SHEETS_EXPIRY_DATE
})

const sheets = google.sheets({
  version: 'v4',
  auth: oAuth2Client
})

exports.updateSheet = async function(updates) {
  try {
    const res = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      resource: {
        valueInputOption: `USER_ENTERED`,
        data: updates.map(p => ({
          range: p.range,
          values: p.values
        }))
      }
    })
    console.log(`Success! ${res.data.totalUpdatedCells} cells updated.`)
  } catch (e) {
    console.log('error writing to sheet ', e.toString())
  }
}

exports.getNamedRanges = async () => {
  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      fields: 'namedRanges'
    })
    return res.data.namedRanges
  } catch (e) {
    console.log(e)
  }

  return null
}

exports.getSheetValues = async (ranges) => {
  try {
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      ranges
    })
    return res.data
  } catch (e) {
    console.log(e)
  }
  return null;
}

exports.addNewSheet = async function(sheetName) {
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      resource: {
        requests: [
          {
            'addSheet': {
              "properties": {
                "title": sheetName,
              }
            }
          }
        ]
      }
    })
    console.log('Success new sheet added with title ' + sheetName)
  } catch (e) {
    console.log('error writing to sheet ', e.toString())
  }
}

exports.appendToSheet = async function(sheetName, values) {
  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEETS_SHEET_ID,
      range: sheetName,
      resource: {
        range: sheetName,
        majorDimension: `ROWS`,
        values,
      },
      valueInputOption: `USER_ENTERED`
    })
    console.log(`Success! ${JSON.stringify(res.data, null, 2)}`)
  } catch (e) {
    console.log('error writing to sheet ', e.toString())
  }
}