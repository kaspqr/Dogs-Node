const UserReport = require('../models/UserReport')
const User = require('../models/User')

const getAllUserReports = async (req, res) => {
    const { tokenRoles } = req.body

    if (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin")) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const userReports = await UserReport.find().lean()
    res.json(userReports)
}

const createNewUserReport = async (req, res) => {
    const { reportee, tokenUserId, text } = req.body

    if (!reportee || !tokenUserId || !text?.length) {
        return res.status(400).json({ message: 'Reportee, reporter and text is required' })
    }

    if (reportee === tokenUserId) {
        return res.status(400).json({ message: 'You may not report yourself' })
    }

    const reportedUser = await User.findById(reportee)
    const userReporter = await User.findById(tokenUserId)

    if (!reportedUser) {
        return res.status(400).json({ message: `Reported user with ID ${reportee} does not exist` })
    }

    if (!userReporter) {
        return res.status(400).json({ message: `Reporter with user ID ${tokenUserId} does not exist` })
    }

    const userReportObject = { reportee, reporter: tokenUserId, text }

    const userReport = await UserReport.create(userReportObject)

    if (userReport) {
        res.status(201).json({ message: `User report with ID ${userReport?.id} created by user ${tokenUserId}` })
    } else {
        res.status(400).json({ message: 'Invalid user report data received' })
    }
}

const deleteUserReport = async (req, res) => {
    const { id } = req.body

    if (!id) return res.status(400).json({ message: 'User report ID Required' })

    const userReport = await UserReport.findById(id).exec()
    if (!userReport) return res.status(400).json({ message: 'User report not found' })

    const result = await userReport.deleteOne()

    const reply = `User report with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllUserReports,
    createNewUserReport,
    deleteUserReport
}
