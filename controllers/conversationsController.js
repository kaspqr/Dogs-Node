const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/User')

const getConversations = async (req, res) => {
    const { id } = req.params
    const { tokenUserId } = req.body

    if (!id) return res.status(400).json({ message: 'User ID is required' })
    if (id !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    const conversations = await Conversation.find({ $or: [{ receiver: id }, { sender: id }] }).lean()

    const conversationsWithLastMessages = await Promise.all(
        conversations.map(async (conversation) => {
            const lastMessage = await Message.findOne({ conversation: conversation._id }).sort({ time: -1 }).lean()

            return { ...conversation, lastMessage };
        })
    );

    const sortedConversations = conversationsWithLastMessages.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.time) - new Date(a.lastMessage.time);
    });

    res.json(sortedConversations)
}

const getConversationById = async (req, res) => {
    const { id } = req.params
    const { tokenUserId } = req.body

    if (!id || !tokenUserId) return res.status(400).json({ message: 'ID and token ID is required' })
    
    const conversation = await Conversation.findById(id).lean()
    if (!conversation) return res.status(400).json({ message: 'Conversation does not exist' })
    
    if (conversation.receiver.toString() !== tokenUserId && conversation.sender.toString() !== tokenUserId) {
        return res.status(400).json({ message: 'Unauthorized' })
    }

    res.json(conversation)
}

const createNewConversation = async (req, res) => {
    const { tokenUserId, receiver } = req.body

    if (!tokenUserId || !receiver) {
        return res.status(400).json({ message: 'Sender and receiver is required' })
    }

    const conversationSender = await User.findById(tokenUserId)
    const conversationReceiver = await User.findById(receiver)

    if (!conversationSender) {
        return res.status(400).json({ message: `Sender with user ID ${tokenUserId} does not exist` })
    }

    if (!conversationReceiver) {
        return res.status(400).json({ message: `Receiver with user ID ${receiver} does not exist` })
    }

    const conversationObject = { sender: tokenUserId, receiver }

    const conversation = await Conversation.create(conversationObject)

    if (conversation) {
        res.status(201).json({ newConversationId: conversation.id, message: `Conversation with ID ${conversation.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid conversation data received' })
    }
}

module.exports = {
    getConversations,
    getConversationById,
    createNewConversation,
}
