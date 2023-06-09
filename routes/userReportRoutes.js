const express = require('express')
const router = express.Router()
const userReportsController = require('../controllers/userReportsController')

router.route('/')
    .get(userReportsController.getAllUserReports)
    .post(userReportsController.createNewUserReport)
    .delete(userReportsController.deleteUserReport)

module.exports = router
