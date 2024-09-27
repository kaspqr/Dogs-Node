const AdvertisementReport = require('../models/AdvertisementReport')
const User = require('../models/User')
const Advertisement = require('../models/Advertisement')

const getAllAdvertisementReports = async (req, res) => {
    const { tokenRoles } = req.body

    if (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin")) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const advertisementReports = await AdvertisementReport.find().lean()
    res.json(advertisementReports)
}

const createNewAdvertisementReport = async (req, res) => {
    const { advertisement, tokenUserId, text } = req.body

    if (!advertisement || !tokenUserId || !text?.length) {
        return res.status(400).json({ message: 'Advertisement, reporter and text is required' })
    }

    const reportedAdvertisement = await Advertisement.findById(advertisement)
    const advertisementReporter = await User.findById(tokenUserId)

    if (!reportedAdvertisement) {
        return res.status(400).json({ message: `Advertisement with ID ${advertisement} does not exist` })
    }

    if (!advertisementReporter) {
        return res.status(400).json({ message: `Reporter with user ID ${tokenUserId} does not exist` })
    }

    const advertisementReportObject = { advertisement, reporter: tokenUserId, text }

    const advertisementReport = await AdvertisementReport.create(advertisementReportObject)

    if (advertisementReport) {
        res.status(201).json({ message: `Advertisement report with ID ${advertisementReport?.id} created by user ${tokenUserId}` })
    } else {
        res.status(400).json({ message: 'Invalid advertisement report data received' })
    }
}

const deleteAdvertisementReport = async (req, res) => {
    const { id, tokenRoles } = req.body

    if (!id) return res.status(400).json({ message: 'Advertisement report ID Required' })

    if (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin")) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const advertisementReport = await AdvertisementReport.findById(id).exec()
    if (!advertisementReport) return res.status(400).json({ message: 'Advertisement report not found' })

    const result = await advertisementReport.deleteOne()

    const reply = `Advertisement report with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllAdvertisementReports,
    createNewAdvertisementReport,
    deleteAdvertisementReport
}
