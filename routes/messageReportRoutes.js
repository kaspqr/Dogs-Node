const express = require('express')
const router = express.Router()
const messageReportsController = require('../controllers/messageReportsController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(verifyJWT, messageReportsController.getAllMessageReports)
    .post(verifyJWT, messageReportsController.createNewMessageReport)
    .delete(verifyJWT, messageReportsController.deleteMessageReport)

module.exports = router
