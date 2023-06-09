const express = require('express')
const router = express.Router()
const advertisementsController = require('../controllers/advertisementsController')

router.route('/')
    .get(advertisementsController.getAllAdvertisements)
    .post(advertisementsController.createNewAdvertisement)
    .patch(advertisementsController.updateAdvertisement)
    .delete(advertisementsController.deleteAdvertisement)

module.exports = router
