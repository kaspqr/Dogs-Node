const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messagesController')

router.route('/')
    .get(messagesController.getAllMessages)
    .post(messagesController.createNewMessage)
    .delete(messagesController.deleteMessage)

module.exports = router
