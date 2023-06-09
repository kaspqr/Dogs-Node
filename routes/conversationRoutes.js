const express = require('express')
const router = express.Router()
const conversationsController = require('../controllers/conversationsController')

router.route('/')
    .get(conversationsController.getAllConversations)
    .post(conversationsController.createNewConversation)
    .delete(conversationsController.deleteConversation)

module.exports = router
