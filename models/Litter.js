const mongoose = require('mongoose')

const litterSchema = new mongoose.Schema({
    mother: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog',
        required: true
    },
    father: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog',
        required: true
    },
    born: {
        type: Date,
        required: true,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Litter', litterSchema)
