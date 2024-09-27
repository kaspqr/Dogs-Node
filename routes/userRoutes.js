const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(usersController.getUsers)
    .post(usersController.createNewUser)
    .patch(verifyJWT, usersController.updateUser)
    .delete(verifyJWT, usersController.deleteUser)

router.route('/:id')
    .get(usersController.getUserById)

/* router.route('/:id/verify/:token')
    .get(usersController.verifyEmail)

router.route('/:id/verifyemail/:emailtoken')
    .get(usersController.verifyNewEmail)

router.route('/resetpassword')
    .patch(usersController.resetPassword) */

module.exports = router
