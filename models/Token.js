const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now(),
        expires: 3600 // 1 hour
    }
})

module.exports = mongoose.model('Token', tokenSchema)
