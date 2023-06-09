const express = require('express')
const router = express.Router()
const advertisementReportsController = require('../controllers/advertisementReportsController')

router.route('/')
    .get(advertisementReportsController.getAllAdvertisementReports)
    .post(advertisementReportsController.createNewAdvertisementReport)
    .delete(advertisementReportsController.deleteAdvertisementReport)

module.exports = router
