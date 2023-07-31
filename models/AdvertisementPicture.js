const mongoose = require('mongoose')

const advertisementPictureSchema = new mongoose.Schema({
    advertisement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement',
        required: true
    },
    picture: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('AdvertisementPicture', advertisementPictureSchema)
