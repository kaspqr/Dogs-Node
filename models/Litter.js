const mongoose = require('mongoose')

const litterSchema = new mongoose.Schema({
    mother: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog',
        required: true
    },
    father: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog'
    },
    breed: {
        type: String,
        required: true,
    },
    born: {
        type: String,
        required: true,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    },
    children: {
        type: Number,
        default: 1,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    region: {
        type: String,
    }
})

module.exports = mongoose.model('Litter', litterSchema)
