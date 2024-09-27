const express = require('express')
const router = express.Router()
const dogReportsController = require('../controllers/dogReportsController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(verifyJWT, dogReportsController.getAllDogReports)
    .post(verifyJWT, dogReportsController.createNewDogReport)
    .delete(verifyJWT, dogReportsController.deleteDogReport)

module.exports = router
