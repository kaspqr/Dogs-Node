const AdvertisementReport = require('../models/AdvertisementReport')
const User = require('../models/User')
const Advertisement = require('../models/Advertisement')
const asyncHandler = require('express-async-handler')

// @desc Get all advertisement reports
// @route GET /advertisementreports
// @access Private
const getAllAdvertisementReports = asyncHandler(async (req, res) => {
    const advertisementReports = await AdvertisementReport.find().lean()
    if (!advertisementReports?.length) {
        return res.status(400).json({ message: 'No advertisement reports found' })
    }
    res.json(advertisementReports)
})

// @desc Create new advertisement report
// @route POST /advertisementreports
// @access Private
const createNewAdvertisementReport = asyncHandler(async (req, res) => {
    const { advertisement, reporter, text } = req.body

    // Confirm data
    if (!advertisement || !reporter || !text?.length) {
        return res.status(400).json({ message: 'Advertisement, reporter and text is required' })
    }

    const reportedAdvertisement = await Advertisement.findById(advertisement)
    const advertisementReporter = await User.findById(reporter)

    if (!reportedAdvertisement) {
        return res.status(400).json({ message: `Advertisement with ID ${advertisement} does not exist` })
    }

    if (!advertisementReporter) {
        return res.status(400).json({ message: `Reporter with user ID ${reporter} does not exist` })
    }

    const advertisementReportObject = { advertisement, reporter, text }

    // Create and store new advertisement report
    const advertisementReport = await AdvertisementReport.create(advertisementReportObject)

    if (advertisementReport) { //Created
        res.status(201).json({ message: `Advertisement report with ID ${advertisementReport?.id} created by user ${reporter}` })
    } else {
        res.status(400).json({ message: 'Invalid advertisement report data received' })
    }
})

// @desc No updating for advertisement reports

// @desc Delete advertisement report
// @route DELETE /advertisementreports
// @access Private
const deleteAdvertisementReport = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Advertisement report ID Required' })
    }

    const advertisementReport = await AdvertisementReport.findById(id).exec()

    if (!advertisementReport) {
        return res.status(400).json({ message: 'Advertisement report not found' })
    }

    const result = await advertisementReport.deleteOne()

    const reply = `Advertisement report with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllAdvertisementReports,
    createNewAdvertisementReport,
    deleteAdvertisementReport
}
