const express = require('express')
const router = express.Router()
const advertisementReportsController = require('../controllers/advertisementReportsController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(verifyJWT, advertisementReportsController.getAllAdvertisementReports)
    .post(verifyJWT, advertisementReportsController.createNewAdvertisementReport)
    .delete(verifyJWT, advertisementReportsController.deleteAdvertisementReport)

module.exports = router
