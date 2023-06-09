const mongoose = require('mongoose')

const litterReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    litter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Litter'
    },
    text: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('LitterReport', litterReportSchema)
