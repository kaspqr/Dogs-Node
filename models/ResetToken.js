const mongoose = require('mongoose')

const resetTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    resetToken: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now(),
        expires: 3600 // 1 hour
    }
})

module.exports = mongoose.model('ResetToken', resetTokenSchema)
