const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messagesController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .post(verifyJWT, messagesController.createNewMessage)

router.route('/conversation/:id')
    .get(verifyJWT, messagesController.getMessages)

router.route('/:id')
    .get(verifyJWT, messagesController.getMessageById)

module.exports = router
