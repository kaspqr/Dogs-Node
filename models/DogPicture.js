const mongoose = require('mongoose')

const dogPictureSchema = new mongoose.Schema({
    dog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog'
    },
    picture: {
        type: String
    }
})

module.export = mongoose.model('DogPicture', dogPictureSchema)
