const express = require('express')
const router = express.Router()
const resetTokensController = require('../controllers/resetTokensController')

router.route('/')
    .post(resetTokensController.createNewResetToken)

router.route('/:resetToken/:user')
    .get(resetTokensController.getResetToken)

module.exports = router
