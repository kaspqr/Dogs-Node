const UserReport = require('../models/UserReport')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all user reports
// @route GET /userreports
// @access Private
const getAllUserReports = asyncHandler(async (req, res) => {
    const userReports = await UserReport.find().lean()
    if (!userReports?.length) {
        return res.status(400).json({ message: 'No user reports found' })
    }
    res.json(userReports)
})

// @desc Create new user report
// @route POST /userreports
// @access Private
const createNewUserReport = asyncHandler(async (req, res) => {
    const { reportee, reporter, text } = req.body

    // Confirm data
    if (!reportee || !reporter || !text?.length) {
        return res.status(400).json({ message: 'Reportee, reporter and text is required' })
    }

    const reportedUser = await User.findById(reportee)
    const userReporter = await User.findById(reporter)

    if (!reportedUser) {
        return res.status(400).json({ message: `Reported user with ID ${reportee} does not exist` })
    }

    if (!userReporter) {
        return res.status(400).json({ message: `Reporter with user ID ${reporter} does not exist` })
    }

    const userReportObject = { reportee, reporter, text }

    // Create and store new user report
    const userReport = await UserReport.create(userReportObject)

    if (userReport) { //Created
        res.status(201).json({ message: `User report with ID ${userReport?.id} created by user ${reporter}` })
    } else {
        res.status(400).json({ message: 'Invalid user report data received' })
    }
})

// @desc No updating for user reports

// @desc Delete user report
// @route DELETE /userreports
// @access Private
const deleteUserReport = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'User report ID Required' })
    }

    const userReport = await UserReport.findById(id).exec()

    if (!userReport) {
        return res.status(400).json({ message: 'User report not found' })
    }

    const result = await userReport.deleteOne()

    const reply = `User report with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUserReports,
    createNewUserReport,
    deleteUserReport
}
