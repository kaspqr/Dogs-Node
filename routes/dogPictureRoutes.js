const express = require('express')
const router = express.Router()
const dogPicturesController = require('../controllers/dogPicturesController')

router.route('/')
    .get(dogPicturesController.getAllDogPictures)
    .post(dogPicturesController.createNewDogPicture)
    .delete(dogPicturesController.deleteDogPicture)

module.exports = router
