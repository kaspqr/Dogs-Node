const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(usersController.getAllUsers) // No need to verify for the GET method
    .post(usersController.createNewUser) // No need to verify in order to create a new user

    .patch(verifyJWT, usersController.updateUser)
    .delete(verifyJWT, usersController.deleteUser)

router.route('/:id/verify/:token')
    .get(usersController.verifyEmail)

module.exports = router
