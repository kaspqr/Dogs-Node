const express = require('express')
const router = express.Router()
const userReportsController = require('../controllers/userReportsController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(verifyJWT, userReportsController.getAllUserReports)
    .post(verifyJWT, userReportsController.createNewUserReport)
    .delete(verifyJWT, userReportsController.deleteUserReport)

module.exports = router
