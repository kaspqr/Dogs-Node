const MessageReport = require('../models/MessageReport')
const User = require('../models/User')
const Message = require('../models/Message')
const Conversation = require('../models/Conversation')

const getAllMessageReports = async (req, res) => {
    const { tokenRoles } = req.body

    if (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin")) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const messageReports = await MessageReport.find().lean()
    res.json(messageReports)
}

const createNewMessageReport = async (req, res) => {
    const { message, tokenUserId, text } = req.body

    if (!message || !tokenUserId || !text?.length) {
        return res.status(400).json({ message: 'Message, reporter and text is required' })
    }

    const reportedMessage = await Message.findById(message)
    const messageReporter = await User.findById(tokenUserId)
    const isReported = await MessageReport.findOne({ message }).exec()

    if (isReported) return res.status(400).json({ message: `Message with ID ${message} has already been reported` })
    if (!reportedMessage) return res.status(400).json({ message: `Message with ID ${message} does not exist` })
    if (!messageReporter) return res.status(400).json({ message: `Reporter with user ID ${tokenUserId} does not exist` })

    const messageConversation = await Conversation.findById(reportedMessage?.conversation)
    if (!messageConversation) return res.status(400).json({ message: `Conversation with ID ${messageConversation} does not exist` })

    const conversationReceiver = await User.findById(messageConversation?.receiver)
    const conversationSender = await User.findById(messageConversation?.sender)

    if (!conversationReceiver) return res.status(400).json(
        { message: `Conversation receiver with ID ${conversationReceiver?.id} does not exist` })
    if (!conversationSender) return res.status(400).json(
        { message: `Conversation sender with ID ${conversationSender?.id} does not exist` })

    if ((tokenUserId !== conversationReceiver?._id?.toString() 
        && tokenUserId !== conversationSender?._id?.toString())
        || tokenUserId === reportedMessage?.sender?.toString()
    ) {
        return res.status(400).json({ message: `Reporter with user ID ${tokenUserId} is not the receiver of message ${message}` })
    }

    const messageReportObject = { message, sender: reportedMessage.sender, reporter: tokenUserId, text }

    const messageReport = await MessageReport.create(messageReportObject)

    if (messageReport) {
        res.status(201).json({ message: `Message report with ID ${messageReport._id} created by user ${tokenUserId}` })
    } else {
        res.status(400).json({ message: 'Invalid message report data received' })
    }
}

const deleteMessageReport = async (req, res) => {
    const { id, tokenRoles } = req.body

    if (!id) return res.status(400).json({ message: 'Message report ID Required' })

    if (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin")) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const messageReport = await MessageReport.findById(id).exec()
    if (!messageReport) return res.status(400).json({ message: 'Message report not found' })

    const result = await messageReport.deleteOne()

    const reply = `Message report with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllMessageReports,
    createNewMessageReport,
    deleteMessageReport
}
