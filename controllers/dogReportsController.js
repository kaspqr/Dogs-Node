const DogReport = require('../models/DogReport')
const User = require('../models/User')
const Dog = require('../models/Dog')
const asyncHandler = require('express-async-handler')

// @desc Get all dog reports
// @route GET /dogreports
// @access Private
const getAllDogReports = asyncHandler(async (req, res) => {
    const dogReports = await DogReport.find().lean()
    if (!dogReports?.length) {
        return res.status(400).json({ message: 'No dog reports found' })
    }
    res.json(dogReports)
})

// @desc Create new dog report
// @route POST /dogreports
// @access Private
const createNewDogReport = asyncHandler(async (req, res) => {
    const { dog, reporter, text } = req.body

    // Confirm data
    if (!dog || !reporter || !text?.length) {
        return res.status(400).json({ message: 'Dog, reporter and text is required' })
    }

    const reportedDog = await Dog.findById(dog)
    const dogReporter = await User.findById(reporter)

    if (!reportedDog) {
        return res.status(400).json({ message: `Dog with ID ${dog} does not exist` })
    }

    if (!dogReporter) {
        return res.status(400).json({ message: `Reporter with user ID ${reporter} does not exist` })
    }

    const dogReportObject = { dog, reporter, text }

    // Create and store new dog report
    const dogReport = await DogReport.create(dogReportObject)

    if (dogReport) { //Created
        res.status(201).json({ message: `Dog report with ID ${dogReport.id} created by user ${reporter}` })
    } else {
        res.status(400).json({ message: 'Invalid dog report data received' })
    }
})

// @desc No updating for dog reports

// @desc Delete dog report
// @route DELETE /dogreports
// @access Private
const deleteDogReport = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Dog report ID Required' })
    }

    const dogReport = await DogReport.findById(id).exec()

    if (!dogReport) {
        return res.status(400).json({ message: 'Dog report not found' })
    }

    const result = await dogReport.deleteOne()

    const reply = `Dog report with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllDogReports,
    createNewDogReport,
    deleteDogReport
}
