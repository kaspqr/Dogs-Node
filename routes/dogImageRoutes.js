const express = require('express')
const router = express.Router()
const dogImagesController = require('../controllers/dogImagesController')

router.route('/')
    .post(dogImagesController.uploadDogImage)

module.exports = router
