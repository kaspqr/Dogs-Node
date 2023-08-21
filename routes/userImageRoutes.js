const express = require('express')
const router = express.Router()
const userImagesController = require('../controllers/userImagesController')

router.route('/')
    .post(userImagesController.uploadUserImage)

module.exports = router
