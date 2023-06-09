const mongoose = require('mongoose')

const advertisementPictureSchema = new mongoose.Schema({
    advertisement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement'
    },
    picture: {
        type: String
    }
})

module.exports = mongoose.model('AdvertisementPicture', advertisementPictureSchema)
