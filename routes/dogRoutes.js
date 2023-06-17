const express = require('express')
const router = express.Router()
const dogsController = require('../controllers/dogsController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(dogsController.getAllDogs) // No need to verify for the GET method

    .post(verifyJWT, dogsController.createNewDog)
    .patch(verifyJWT, dogsController.updateDog)
    .delete(verifyJWT, dogsController.deleteDog)

module.exports = router
