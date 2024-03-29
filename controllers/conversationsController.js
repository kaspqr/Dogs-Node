const Conversation = require('../models/Conversation')
const User = require('../models/User')

// @desc Get all conversations
// @route GET /conversations
// @access Private
const getAllConversations = async (req, res) => {
    const conversations = await Conversation.find().lean()
    res.json(conversations)
}

// @desc Create new conversation
// @route POST /conversations
// @access Private
const createNewConversation = async (req, res) => {
    const { sender, receiver } = req.body

    // Confirm data
    if (!sender || !receiver) {
        return res.status(400).json({ message: 'Sender and receiver is required' })
    }

    const conversationSender = await User.findById(sender)
    const conversationReceiver = await User.findById(receiver)

    if (!conversationSender) {
        return res.status(400).json({ message: `Sender with user ID ${sender} does not exist` })
    }

    if (!conversationReceiver) {
        return res.status(400).json({ message: `Receiver with user ID ${receiver} does not exist` })
    }

    const conversationObject = { sender, receiver }

    // Create and store new conversation
    const conversation = await Conversation.create(conversationObject)

    if (conversation) { //Created
        res.status(201).json({ newConversationId: conversation.id, message: `Conversation with ID ${conversation.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid conversation data received' })
    }
}

// @desc No updating for conversations

// @desc Delete conversation
// @route DELETE /conversations
// @access Private
const deleteConversation = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Conversation ID Required' })
    }

    const conversation = await Conversation.findById(id).exec()

    if (!conversation) {
        return res.status(400).json({ message: 'Conversation not found' })
    }

    const result = await conversation.deleteOne()

    const reply = `Conversation with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllConversations,
    createNewConversation,
    deleteConversation
}
