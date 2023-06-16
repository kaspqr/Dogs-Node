const LitterReport = require('../models/LitterReport')
const User = require('../models/User')
const Litter = require('../models/Litter')

// @desc Get all litter reports
// @route GET /litterreports
// @access Private
const getAllLitterReports = async (req, res) => {
    const litterReports = await LitterReport.find().lean()
    if (!litterReports?.length) {
        return res.status(400).json({ message: 'No litter reports found' })
    }
    res.json(litterReports)
}

// @desc Create new litter report
// @route POST /litterreports
// @access Private
const createNewLitterReport = async (req, res) => {
    const { litter, reporter, text } = req.body

    // Confirm data
    if (!litter || !reporter || !text?.length) {
        return res.status(400).json({ message: 'Litter, reporter and text is required' })
    }

    const reportedLitter = await Litter.findById(litter)
    const litterReporter = await User.findById(reporter)

    if (!reportedLitter) {
        return res.status(400).json({ message: `Litter with ID ${litter} does not exist` })
    }

    if (!litterReporter) {
        return res.status(400).json({ message: `Reporter with user ID ${reporter} does not exist` })
    }

    const litterReportObject = { litter, reporter, text }

    // Create and store new litter report
    const litterReport = await LitterReport.create(litterReportObject)

    if (litterReport) { //Created
        res.status(201).json({ message: `Litter report with ID ${litterReport.id} created by user ${reporter}` })
    } else {
        res.status(400).json({ message: 'Invalid litter report data received' })
    }
}

// @desc No updating for litter reports

// @desc Delete litter report
// @route DELETE /litterreports
// @access Private
const deleteLitterReport = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Litter report ID Required' })
    }

    const litterReport = await LitterReport.findById(id).exec()

    if (!litterReport) {
        return res.status(400).json({ message: 'Litter report not found' })
    }

    const result = await litterReport.deleteOne()

    const reply = `Litter report with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllLitterReports,
    createNewLitterReport,
    deleteLitterReport
}
