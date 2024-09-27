const express = require('express')
const router = express.Router()
const tokensController = require('../controllers/tokensController')

router.route('/:token/:user')
    .get(tokensController.getUserToken)

module.exports = router
