const mongoose = require('mongoose')

const dogReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog'
    },
    text: {
        type: String,
        required: true
    }
})

module.export = mongoose.model('DogReport', dogReportSchema)
