const mongoose = require('mongoose')

const dogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    mother: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog'
    },
    father: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog'
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
        type: String
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
    location: {
        type: String
    }
})

module.exports = mongoose.model('Dog', dogSchema)
