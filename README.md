## Build Your Own Mint

### Important Disclaimer

- Credentials are stored in `lib/credentials.json`. (Note this file is in .gitignore)

- All this repo does is talking to Plaid/Google APIs and writing tokens to your local file system. If you don't feel safe entering real bank credentials, audit the code yourself to make sure.

### Setting up API keys

#### Plaid

- You will first need to sign up for [Plaid](https://plaid.com/) and apply for the development plan. You might need to wait for a day or two to get approved. It's free and limited to 100 items (i.e. banks), so it should be more than enough for your personal use.

- Rename `lib/credentials.sample.json` to `lib/credentials.json`.

- Once approved, fill out `client_id`, `secret` and `public_key` in `lib/credentials.json` under `plaid`.

- Now you need to connect to your financial institutions to generate access tokens.

  Run `npm run token-plaid <account>` where `account` is an id for the bank you want to connect (it's for your personal reference, so you can name it anything). This will start a local server which you can visit in your browser and go through the authentication flow. Once you've linked the bank, its associated access token will be written to `lib/credentials.json` under `plaid.tokens.<account>`.

  This process needs to be repeated for each bank you want to connect. Make sure to run each with a different `account` name.

- If you've done everything correctly, running `npm run test-plaid` now should log the recent transactions in your connected accounts.

#### Sheets

> I use a Google Sheet because it's convenient. If you want to build your own fancy interface, you can totally do that - but that's out of scope for this demo.

- First, create a Google Sheets spreadsheet, and save its ID in `lib/credentials.json` as `sheets.sheet_id`.

- Then, go to [Google Sheets API Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs), and click the "Enable the Google Sheets API" button. Follow instructions and download the JSON file. Copy the following fields into `lib/credentials.json` under `sheets`:

  - `client_id`
  - `client_secret`
  - `redirect_uris`

- Run `npm run token-sheets`. This will prompt for auth and save the token in `lib/credentials.json` under `sheets.token`.

- Now run `npm run test-sheets`. You should see your sheet's cell A1 with "It worked!".

### Transform your Data

- With the APIs sorted out, now it's time to connect them. Open `lib/transform.js` - this is where you can write your own logic to map incoming transactions to cell updates. How to structure the spreadsheet to use that data is up to you.

- By default, the transaction date range is from the beginning of last month to now. You can adjust this in `lib/fetch.js`.

- Once you've setup your own transform logic, run `node index.js`. If everything works, your spreadsheet should have been updated.

- This repo only handles transactions, but it should be pretty straightforward to add balances.

### Automate the Updates

The repo contains a [CircleCI](https://circleci.com/) config file which runs the update every day at 5AM UTC (midnight US Eastern time). All you need to do is setup your project on CircleCI and that's it (again, make sure to use a private repo). You can adjust the cron config to tweak the time/frequency of the updates.
