const mongoose = require('mongoose')

const emailTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    emailToken: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now(),
        expires: 3600 // 1 hour
    }
})

module.exports = mongoose.model('EmailToken', emailTokenSchema)
