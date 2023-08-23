const express = require('express')
const router = express.Router()
const tokensController = require('../controllers/tokensController')

router.route('/')
    .get(tokensController.getAllTokens)

module.exports = router
