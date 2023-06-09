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
        required: true
    },
    info: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Advertisement', advertisementSchema)
