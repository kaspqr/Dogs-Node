const express = require('express')
const router = express.Router()
const messageReportsController = require('../controllers/messageReportsController')

router.route('/')
    .get(messageReportsController.getAllMessageReports)
    .post(messageReportsController.createNewMessageReport)
    .delete(messageReportsController.deleteMessageReport)

module.exports = router
