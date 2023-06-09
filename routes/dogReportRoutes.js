const express = require('express')
const router = express.Router()
const dogReportsController = require('../controllers/dogReportsController')

router.route('/')
    .get(dogReportsController.getAllDogReports)
    .post(dogReportsController.createNewDogReport)
    .delete(dogReportsController.deleteDogReport)

module.exports = router
