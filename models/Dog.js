const mongoose = require('mongoose')

const dogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    female: {
        type: Boolean,
        required: true
    },
    litter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Litter'
    },
    active: {
        type: Boolean,
        default: true
    },
    heat: {
        type: Boolean,
        default: false
    },
    sterilized: {
        type: Boolean,
        default: false
    },
    birth: {
        type: String,
        default: Date.now,
        required: true
    },
    death: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    breed: {
        type: String,
        required: true
    },
    microchipped: {
        type: Boolean,
        default: false
    },
    chipnumber: {
        type: String
    },
    passport: {
        type: Boolean,
        default: false
    },
    info: {
        type: String
    },
    instagram: {
        type: String
    },
    facebook: {
        type: String
    },
    youtube: {
        type: String
    },
    tiktok: {
        type: String
    },
    country: {
        type: String,
        required: true
    },
    region: {
        type: String
    },
    image: {
        type: String
    }

})

module.exports = mongoose.model('Dog', dogSchema)
