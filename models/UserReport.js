const mongoose = require('mongoose')

const userReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reportee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        required: true
    }
})

module.export = mongoose.model('UserReport', userReportSchema)
