const express = require('express')
const router = express.Router()
const resetTokensController = require('../controllers/resetTokensController')

router.route('/')
    .get(resetTokensController.getAllResetTokens)
    .post(resetTokensController.createNewResetToken)

module.exports = router
