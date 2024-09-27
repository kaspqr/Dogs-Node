const express = require('express')
const router = express.Router()
const dogImagesController = require('../controllers/dogImagesController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .post(verifyJWT, dogImagesController.uploadDogImage)

module.exports = router
