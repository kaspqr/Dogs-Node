const express = require('express')
const router = express.Router()
const advertisementPicturesController = require('../controllers/advertisementPicturesController')

router.route('/')
    .get(advertisementPicturesController.getAllAdvertisementPictures)
    .post(advertisementPicturesController.createNewAdvertisementPicture)
    .delete(advertisementPicturesController.deleteAdvertisementPicture)

module.exports = router
