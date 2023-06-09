const express = require('express')
const router = express.Router()
const litterReportsController = require('../controllers/litterReportsController')

router.route('/')
    .get(litterReportsController.getAllLitterReports)
    .post(litterReportsController.createNewLitterReport)
    .delete(litterReportsController.deleteLitterReport)

module.exports = router
