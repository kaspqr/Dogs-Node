const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const User = require('../models/User')

const getMessages = async (req, res) => {
    const { id } = req.params
    const { tokenUserId } = req.body

    if (!id || !tokenUserId) return res.status(400).json({ message: `Conversation ID and token ID is required` })

    const conversation = await Conversation.findById(id).lean()
    if (!conversation) return res.status(400).json({ message: `Conversation does not exist` })

    if (conversation.sender.toString() !== tokenUserId && conversation.receiver.toString() !== tokenUserId) {
        return res.status(401).json({ message: `Unauthorized` })
    }

    const messages = await Message.find({ conversation: id }).lean()

    res.json(messages)
}

const getMessageById = async (req, res) => {
    const { id } = req.params
    const { tokenUserId, tokenRoles } = req.body

    if (!id || !tokenUserId) return res.status(400).json({ message: `Conversation ID and token ID is required` })

    const message = await Message.findById(id).lean()
    if (!message) return res.status(400).json({ message: `Message does not exist` })

    const conversation = await Conversation.findById(message.conversation).lean()
    if (!conversation) return res.status(400).json({ message: `Conversation does not exist` })

    if ((!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin")) &&
        (conversation.sender.toString() !== tokenUserId && conversation.receiver.toString() !== tokenUserId)) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    res.json(message)
}

const createNewMessage = async (req, res) => {
    const { tokenUserId, conversation, text, receiver } = req.body

    if (!tokenUserId || (!conversation && !receiver) || !text?.length) {
        return res.status(400).json({ message: 'Sender, text and either conversation or receiver is required' })
    }

    const messageSender = await User.findById(tokenUserId)
    if (!messageSender) return res.status(400).json({ message: `Sender with user ID ${tokenUserId} does not exist` })

    const messageObject = { sender: tokenUserId, text }

    if (!conversation) {
        if (tokenUserId === receiver) {
            return res.status(400).json({ message: `Sender ${tokenUserId} and ${receiver} are the same user` })
        }

        const isReceiver = await User.findById(receiver).exec()
        const isConversationReceiver = await Conversation.findOne({ "receiver": receiver, "sender": tokenUserId }).exec()
        const isConversationSender = await Conversation.findOne({ "sender": receiver, "receiver": tokenUserId }).exec()

        if (isConversationReceiver || isConversationSender) {
                return res.status(400).json({ message: `User ${tokenUserId} already has a conversation with user ${receiver}` })
        }

        if (!isReceiver) {
            return res.status(400).json({ message: `Receiver with id ${receiver} does not exist` })
        }

        const newConversation = await Conversation.create({ sender: tokenUserId, receiver })

        messageObject.conversation = newConversation?.id
    } else {
        const isConversation = await Conversation.findById(conversation).exec()

        if (!isConversation) {
            return res.status(400).json({ message: `Conversation with id ${conversation} does not exist` })
        }

        if (tokenUserId !== isConversation?.sender?.toString() && tokenUserId !== isConversation?.receiver?.toString()) {
            return res.status(400).json({ message: `Sender ${tokenUserId} not part of conversation ${conversation}` })
        }

        messageObject.conversation = conversation
    }


    const message = await Message.create(messageObject)

    if (message) {
        res.status(201).json({ message: `Message with ID ${message?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid message data received' })
    }
}

module.exports = {
    getMessages,
    getMessageById,
    createNewMessage,
}
