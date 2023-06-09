const mongoose = require('mongoose')

const messageReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    text: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('MessageReport', messageReportSchema)
