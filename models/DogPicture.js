const mongoose = require('mongoose')

const dogPictureSchema = new mongoose.Schema({
    dog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog',
        required: true
    },
    picture: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('DogPicture', dogPictureSchema)
