require('dotenv').config()

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const oAuth2Client = require('../lib/googleClient')
const saveEnv = require('./saveEnv')

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/spreadsheets']
})

console.log('Authorize Google Sheets by visiting this url:', authUrl)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('Enter the code from that page here: ', (code) => {
  rl.close()
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error while trying to retrieve access token', err)

    let vars = {}
    const tokenEnvVars = Object.keys(token).forEach(key => {
      vars[`SHEETS_${key.toUpperCase()}`] = token[key]
    })

    saveEnv(vars)
    console.log(`Token stored in .env.`)
  })
})
