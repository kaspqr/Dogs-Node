const express = require('express')
const router = express.Router()
const conversationsController = require('../controllers/conversationsController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/user/:id')
    .get(verifyJWT, conversationsController.getConversations)

router.route('/:id')
    .get(verifyJWT, conversationsController.getConversationById)

router.route('/')
    .post(verifyJWT, conversationsController.createNewConversation)

module.exports = router
