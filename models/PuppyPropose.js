const mongoose = require('mongoose')

const puppyProposeSchema = new mongoose.Schema({
    puppy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog',
        required: true
    },
    litter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Litter',
        required: true
    }
})

module.exports = mongoose.model('PuppyPropose', puppyProposeSchema)
