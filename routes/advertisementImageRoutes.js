const express = require('express')
const router = express.Router()
const advertisementImagesController = require('../controllers/advertisementImagesController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .post(verifyJWT, advertisementImagesController.uploadAdvertisementImage)

module.exports = router
