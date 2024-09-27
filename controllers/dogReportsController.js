const DogReport = require('../models/DogReport')
const User = require('../models/User')
const Dog = require('../models/Dog')

const getAllDogReports = async (req, res) => {
    const { tokenRoles } = req.body

    if (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin")) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const dogReports = await DogReport.find().lean()
    res.json(dogReports)
}

const createNewDogReport = async (req, res) => {
    const { dog, tokenUserId, text } = req.body

    if (!dog || !tokenUserId || !text?.length) {
        return res.status(400).json({ message: 'Dog, reporter and text is required' })
    }

    const reportedDog = await Dog.findById(dog)
    const dogReporter = await User.findById(tokenUserId)

    if (!reportedDog) {
        return res.status(400).json({ message: `Dog with ID ${dog} does not exist` })
    }

    if (!dogReporter) {
        return res.status(400).json({ message: `Reporter with user ID ${tokenUserId} does not exist` })
    }

    const dogReportObject = { dog, reporter: tokenUserId, text }

    const dogReport = await DogReport.create(dogReportObject)

    if (dogReport) {
        res.status(201).json({ message: `Dog report with ID ${dogReport.id} created by user ${tokenUserId}` })
    } else {
        res.status(400).json({ message: 'Invalid dog report data received' })
    }
}

const deleteDogReport = async (req, res) => {
    const { id, tokenRoles } = req.body

    if (!id) return res.status(400).json({ message: 'Dog report ID Required' })

    if (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin")) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const dogReport = await DogReport.findById(id).exec()
    if (!dogReport) return res.status(400).json({ message: 'Dog report not found' })

    const result = await dogReport.deleteOne()

    const reply = `Dog report with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllDogReports,
    createNewDogReport,
    deleteDogReport
}
