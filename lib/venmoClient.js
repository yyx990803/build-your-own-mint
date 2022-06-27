require('dotenv').config()
const fs = require('fs')
const dfd = require('danfojs-node')

const getVenmoFilePaths = async () => {
    const fileNames = await fs.promises.readdir(process.env.VENMO_DIR)
    return fileNames.map(fName => `${process.env.VENMO_DIR}/${fName}`)
}

const getAllTransactions = async () => {
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
        df.head(10).print()
        // console.log(df.loc({rows: ["4"]}).values)
        let dfNormalized = normalizeDataframe(df)

        return dfNormalized.values
    } catch (e) {
        console.log('error fetching transactions for file path ' + fPath)
    }
    return []
}

const normalizeDataframe = (df) => {
    // TO DO:
    // drop first column
    // make row with rowIdx 2 as column headers
    // drop row with rowIdx 3
    // drop last row
    // make a sub df of interested columns
    return df
}


module.exports = { getAllTransactions }