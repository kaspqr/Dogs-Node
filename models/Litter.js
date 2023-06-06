const mongoose = require('mongoose')

const litterSchema = new mongoose.Schema({
    mother: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog'
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.export = mongoose.model('Litter', litterSchema)
