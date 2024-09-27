const express = require('express')
const router = express.Router()
const userImagesController = require('../controllers/userImagesController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .post(verifyJWT, userImagesController.uploadUserImage)

module.exports = router
