const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(usersController.getAllUsers) // no need to verify for the GET method

    .post(verifyJWT, usersController.createNewUser)
    .patch(verifyJWT, usersController.updateUser)
    .delete(verifyJWT, usersController.deleteUser)

module.exports = router
