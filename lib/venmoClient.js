require('dotenv').config()
const fs = require('fs')
const dfd = require('danfojs-node')
const HEADER_IDX = '2'
const DATA_START_IDX = '4'
const USEFUL_COLS = ['Datetime', 'Type', 'From', 'To', 'Amount (total)']

const getVenmoFilePaths = async () => {
    const fileNames = await fs.promises.readdir(process.env.VENMO_DIR)
    return fileNames.map(fName => `${process.env.VENMO_DIR}/${fName}`)
}

const getAllVenmoTransactions = async () => {
    const filePaths = await getVenmoFilePaths()
    if (!filePaths || !filePaths.length) {
        return []
    }

    let allTransactions = []

    for (const fPath of filePaths) {
        let transactions = await getTransactions(fPath)
        allTransactions.push(...transactions)
    }

    return allTransactions
}

const getTransactions = async (fPath) => {
    try {
        let df = await dfd.readCSV(fPath, { header: false })
        let dfNormalized = normalizeDataframe(df)

        return mapTransactionsFromVenmoData(dfd.toJSON(dfNormalized))
    } catch (e) {
        console.log('error fetching transactions for file path ' + fPath)
    }
    return []
}

const normalizeDataframe = (df) => {
    // drop first column
    // make row with rowIdx 2 as column headers
    // drop row with rowIdx 3
    // drop last row (not needed)
    // make a sub df of interested columns

    let headers = df.loc({rows: [HEADER_IDX]}).values.flatMap(val => val)
    let rows = df.shape[0]
    let data = df.loc({ rows: [`${DATA_START_IDX}:${rows-1}`] }).values

    let df_normalized = new dfd.DataFrame(data, {columns: headers})

    df_normalized = df_normalized.loc({columns: USEFUL_COLS})

    let paymentTypeFilter = df_normalized['Type'].eq('Payment')

    df_normalized = df_normalized.loc({ rows: paymentTypeFilter })

    let totalAmts = df_normalized['Amount (total)'].values
    let totalAmtsScalar = []
    totalAmts.forEach(currency => {
        let num = Number(currency.replace(/[^0-9.-]+/g,""));
        totalAmtsScalar.push(num)
    })

    df_normalized.addColumn("Amount (scalar)", totalAmtsScalar, { inplace: true });

    return df_normalized
}

// loop through values and make a list of transactions
const mapTransactionsFromVenmoData = (venmoData) => {
    if (!venmoData)
        return []

    return venmoData.map((transaction) => {
        return {
            Account: 'Venmo',
            Name: transaction['From'],
            Date: transaction['Datetime'],
            Amount: transaction['Amount (scalar)'],
            Category: transaction['Type']
        }
    })
}

module.exports = { getAllVenmoTransactions }