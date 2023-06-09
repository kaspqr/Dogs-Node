const express = require('express')
const router = express.Router()
const dogsController = require('../controllers/dogsController')

router.route('/')
    .get(dogsController.getAllDogs)
    .post(dogsController.createNewDog)
    .patch(dogsController.updateDog)
    .delete(dogsController.deleteDog)

module.exports = router