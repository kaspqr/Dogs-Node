const mongoose = require('mongoose')

const dogProposeSchema = new mongoose.Schema({
    dog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('DogPropose', dogProposeSchema)
