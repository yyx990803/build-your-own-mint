const moment = require('moment')
const dfd = require("danfojs-node")
const { updateSheet, getSheetValues, getNamedRanges } = require('./sheetsCrud')
const { getDefaultStartEndDates } = require('./utils')

let startDate = getDefaultStartEndDates().startDate
let endDate = getDefaultStartEndDates().endDate

exports.runAudit = async (auditStartDate, auditEndDate) => {

    if (auditStartDate)
        startDate = auditStartDate

    if (auditEndDate)
        endDate = auditEndDate
    // endDate is current date
    // get month and year from the date to start audit
    // get billsInfo from google sheets filter namedRanges filter them with above start and end dates.
    // calculate amt owed
    // calculate amt given from transactions tab
    const billNamedRangesToAudit = await getNamedRangeNames()
    // below is a danfojs dataframe
    const amountOwedBySearchKeyDF = await getAmountOwedBySearchKey(billNamedRangesToAudit)
    const listOfSearchKeys = amountOwedBySearchKeyDF['SearchKey'].values
    const amountPaidBySearchKeyDF = await buildDataFrameOfAmtPaidBySearchKey(listOfSearchKeys)

    let dfAuditFinal = dfd.merge({ 'left': amountOwedBySearchKeyDF, 'right': amountPaidBySearchKeyDF, 'on': ['SearchKey'], how: 'inner'})

    dfAuditFinal.print()

    // TO DO: write these results to a new sheet
}

const getNamedRangeNames = async () => {
    const namedRanges = await getNamedRanges()
    const namedRangeNames = namedRanges.map((namedRange) => namedRange.name)
    return filterNamedRanges(namedRangeNames, startDate)
}

const getAmountOwedBySearchKey = async (namedRangeNames) => {
    const sheetVals = await getSheetValues(namedRangeNames)
    const { valueRanges } = sheetVals
    const allBillInfoData = getDataFromValueRanges(valueRanges)
    return buildDataFrameOfAmtOwedBySearchKey(allBillInfoData)
}

const filterNamedRanges = (namedRangeNames) => {
    return namedRangeNames.filter((namedRangeName) => {
        const tokens = namedRangeName.split('_')

        const month = tokens[0];
        const day = parseInt(tokens[1]);
        const monthNum = parseInt(moment().month(month).format("M"))
        const year = parseInt(tokens[2])

        const date = new moment({ year, month: monthNum, day })

        return date.isBetween(startDate, endDate)
    })
}

const getDataFromValueRanges = (valueRanges) => {
    let data = []
    valueRanges.forEach(valueRange => {
        const { values:dataGrid } = valueRange
        dataGrid.forEach((row)=> data.push(row))
    })
    return data
}

const buildDataFrameOfAmtOwedBySearchKey = (allBillInfoData) => {
    const columns = ['AmountOwed', 'SearchKey']

    let df = new dfd.DataFrame(allBillInfoData, { columns })

    df = df.asType('AmountOwed', 'float32')

    df = df.loc({ rows: df['SearchKey'].ne('N/A') })

    return df.groupby(['SearchKey']).sum()
}

const buildDataFrameOfAmtPaidBySearchKey = async (searchKeys) => {
    // filter by dates
    // and then filter by search Keys
    const sheetVals = await getSheetValues(['transactions'])
    const { valueRanges } = sheetVals
    const transactionData = getDataFromValueRanges(valueRanges)

    let startMoment = moment(startDate).valueOf()
    let endMoment = moment(endDate).valueOf()

    let columns = transactionData[0]
    let data = transactionData.slice(1)

    let df = new dfd.DataFrame(data, { columns })

    df = df.asType('Timestamp', 'int32')

    let dateFilterCondition = df['Timestamp'].gt(startMoment).and(df['Timestamp'].lt(endMoment))

    let dfDateFiltered = df.loc({ rows: dateFilterCondition })

    dfDateFiltered.resetIndex({ inplace: true })

    let transactionDescriptions = dfDateFiltered['Name'].values

    let allRowsToInclude = []

    let rowIdxToSearchKeyMap = new Map()

    searchKeys.forEach((searchKey) => {
        let rowsToInclude = transactionDescriptions.flatMap((desc, idx) => desc.toLowerCase().includes(searchKey.toLowerCase()) ? idx: [])
        allRowsToInclude.push(...rowsToInclude)
        rowsToInclude.forEach((rowIdx) => rowIdxToSearchKeyMap.set(rowIdx, searchKey))
    })

    let dfFinal = dfDateFiltered.loc({ rows: allRowsToInclude })

    dfFinal = dfFinal.sortIndex()

    let searchKeyColData = []

    dfFinal.index.forEach((idx) => {
        searchKeyColData.push(rowIdxToSearchKeyMap.get(idx))
    })

    dfFinal.addColumn("SearchKey", searchKeyColData, { inplace: true });

    dfFinal = dfFinal.asType('Amount', 'float32')

    let dfAudit = dfFinal.loc({columns: ['SearchKey', 'Amount']})

    return dfAudit.groupby(['SearchKey']).sum()
}