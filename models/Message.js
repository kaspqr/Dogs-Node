const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    time: {
        type: Date,
        default: Date.now
    },
    text: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Message', messageSchema)
