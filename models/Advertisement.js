const mongoose = require('mongoose')

const advertisementSchema = new mongoose.Schema({
    premium: {
        type: Boolean,
        default: false
    },
    poster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: '$'
    },
    info: {
        type: String,
    },
    location: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Advertisement', advertisementSchema)
