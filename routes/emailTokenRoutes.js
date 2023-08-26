const express = require('express')
const router = express.Router()
const emailTokensController = require('../controllers/emailTokensController')

router.route('/')
    .get(emailTokensController.getAllEmailTokens)

module.exports = router
