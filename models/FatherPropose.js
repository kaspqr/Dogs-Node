const mongoose = require('mongoose')

const fatherProposeSchema = new mongoose.Schema({
    father: {
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

module.exports = mongoose.model('FatherPropose', fatherProposeSchema)
