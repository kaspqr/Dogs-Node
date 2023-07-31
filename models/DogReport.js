const mongoose = require('mongoose')

const dogReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog',
        required: true
    },
    text: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('DogReport', dogReportSchema)
