const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all messages
// @route GET /messages
// @access Private
const getAllMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find().lean()
    if (!messages?.length) {
        return res.status(400).json({ message: 'No messages found' })
    }
    res.json(messages)
})

// @desc Create new message
// @route POST /messages
// @access Private
const createNewMessage = asyncHandler(async (req, res) => {
    const { sender, conversation, text, receiver } = req.body

    // Confirm data
    if (!sender || (!conversation && !receiver) || !text.length) {
        return res.status(400).json({ message: 'Sender, text and either conversation or receiver is required' })
    }

    const messageSender = await User.findById(sender)

    if (!messageSender) {
        return res.status(400).json({ message: `Sender with user ID ${sender} does not exist` })
    }

    const messageObject = { sender, text }

    if (!conversation) { // No conversation, so create one first
        if (sender === receiver) {
            return res.status(400).json({ message: `Sender ${sender} and ${receiver} are the same user` })
        }

        const isReceiver = await User.findById(receiver).exec()
        const isConversationReceiver = await Conversation.findOne({ "receiver": receiver }).lean().exec()
        const isConversationSender = await Conversation.findOne({ "sender": receiver }).lean().exec()

        if (isConversationReceiver === isConversationSender && isConversationReceiver) {
                return res.status(400).json({ message: `User ${sender} already has a conversation with user ${receiver}` })
        }

        if (!isReceiver) {
            return res.status(400).json({ message: `Receiver with id ${receiver} does not exist` })
        }

        const newConversation = await Conversation.create({ sender, receiver })
        messageObject.conversation = newConversation.id
    } else {
        const isConversation = await Conversation.findById(conversation).exec()

        if (!isConversation) {
            return res.status(400).json({ message: `Conversation with id ${conversation} does not exist` })
        }

        if (sender !== isConversation.sender && sender !== isConversation.receiver) {
            return res.status(400).json({ message: `Sender ${sender} is not part of conversation ${conversation}` })
        }

        messageObject.conversation = conversation
    }


    // Create and store new conversation
    const message = await Message.create(messageObject)

    if (message) { //Created
        res.status(201).json({ message: `Message with ID ${message.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid message data received' })
    }
})

// @desc No updating for messages

// @desc Delete message
// @route DELETE /messages
// @access Private
const deleteMessage = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Message ID Required' })
    }

    const message = await Message.findById(id).exec()

    if (!message) {
        return res.status(400).json({ message: 'Message not found' })
    }

    const result = await message.deleteOne()

    const reply = `Message with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllMessages,
    createNewMessage,
    deleteMessage
}
