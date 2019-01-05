const fs = require('fs')
const path = require('path')
const readline = require('readline')
const oAuth2Client = require('../lib/googleClient')

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/spreadsheets']
})

console.log('Authorize Google Sheets by visiting this url:', authUrl)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const credPath = path.resolve('../lib/credentials.json')

rl.question('Enter the code from that page here: ', (code) => {
  rl.close()
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error while trying to retrieve access token', err)
    const current = JSON.parse(fs.readFileSync(credPath, 'utf-8'))
    current.sheets.access_token = token
    fs.writeFileSync(credPath, JSON.stringify(current, null, 2))
    console.log(`Token stored in ${credPath}.`)
  })
})
