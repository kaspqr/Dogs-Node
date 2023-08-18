const MessageReport = require('../models/MessageReport')
const User = require('../models/User')
const Message = require('../models/Message')
const Conversation = require('../models/Conversation')

// @desc Get all message reports
// @route GET /messagereports
// @access Private
const getAllMessageReports = async (req, res) => {
    const messageReports = await MessageReport.find().lean()
    res.json(messageReports)
}

// @desc Create new message report
// @route POST /messagereports
// @access Private
const createNewMessageReport = async (req, res) => {
    const { message, reporter, text } = req.body

    // Confirm data
    if (!message || !reporter || !text?.length) {
        return res.status(400).json({ message: 'Message, reporter and text is required' })
    }

    const reportedMessage = await Message.findById(message)
    const messageReporter = await User.findById(reporter)
    const isReported = await MessageReport.findOne({ message }).lean().exec()

    if (isReported) {
        return res.status(400).json({ message: `Message with ID ${message} has already been reported` })
    }

    if (!reportedMessage) {
        return res.status(400).json({ message: `Message with ID ${message} does not exist` })
    }

    if (!messageReporter) {
        return res.status(400).json({ message: `Reporter with user ID ${reporter} does not exist` })
    }

    const messageConversation = await Conversation.findById(reportedMessage?.conversation)

    if (!messageConversation) {
        return res.status(400).json({ message: `Conversation with ID ${messageConversation} does not exist` })
    }

    const conversationReceiver = await User.findById(messageConversation?.receiver)
    const conversationSender = await User.findById(messageConversation?.sender)

    if (!conversationReceiver) {
        return res.status(400).json({ message: `Conversation receiver with ID ${conversationReceiver?.id} does not exist` })
    }

    if (!conversationSender) {
        return res.status(400).json({ message: `Conversation sender with ID ${conversationSender?.id} does not exist` })
    }

    if ((reporter !== conversationReceiver?.id?.toString() 
        && reporter !== conversationSender?.id?.toString())
        || reporter === reportedMessage?.sender?.toString()) {
        return res.status(400).json({ message: `Reporter with user ID ${reporter} is not the receiver of message ${message}` })
    }

    const messageReportObject = { message, reporter, text }

    // Create and store new message report
    const messageReport = await MessageReport.create(messageReportObject)

    if (messageReport) { //Created
        res.status(201).json({ message: `Message report with ID ${messageReport.id} created by user ${reporter}` })
    } else {
        res.status(400).json({ message: 'Invalid message report data received' })
    }
}

// @desc No updating for message reports

// @desc Delete message report
// @route DELETE /messagereports
// @access Private
const deleteMessageReport = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Message report ID Required' })
    }

    const messageReport = await MessageReport.findById(id).exec()

    if (!messageReport) {
        return res.status(400).json({ message: 'Message report not found' })
    }

    const result = await messageReport.deleteOne()

    const reply = `Message report with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllMessageReports,
    createNewMessageReport,
    deleteMessageReport
}
