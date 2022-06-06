const moment = require('moment')
const getDefaultStartEndDates = () => {
    // start from beginning of last month...
    const startDate = moment()
        .subtract(3, 'month')
        .startOf('month')
        .format('YYYY-MM-DD');
// ends now.
// this ensures we always fully update last month,
// and keep current month up-to-date
    const endDate = moment().format('YYYY-MM-DD')

    return { startDate, endDate }
}

module.exports = { getDefaultStartEndDates }