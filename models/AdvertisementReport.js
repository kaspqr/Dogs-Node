const mongoose = require('mongoose')

const advertisementReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    advertisement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement'
    },
    text: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('AdvertisementReport', advertisementReportSchema)
