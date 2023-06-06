const mongoose = require('mongoose')

const dogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
    gender: {
        type: String,
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
        type: String
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
    info: {
        type: String
    },
    location: {
        type: String
    }
})

module.export = mongoose.model('Dog', dogSchema)
