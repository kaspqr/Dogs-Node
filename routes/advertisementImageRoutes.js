const express = require('express')
const router = express.Router()
const advertisementImagesController = require('../controllers/advertisementImagesController')

router.route('/')
    .post(advertisementImagesController.uploadAdvertisementImage)

module.exports = router
