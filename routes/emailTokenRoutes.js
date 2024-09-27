const express = require('express')
const router = express.Router()
const emailTokensController = require('../controllers/emailTokensController')

router.route('/:emailToken/:user')
    .get(emailTokensController.getEmailToken)

module.exports = router
