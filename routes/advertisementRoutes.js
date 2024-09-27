const express = require('express')
const router = express.Router()
const advertisementsController = require('../controllers/advertisementsController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(advertisementsController.getAdvertisements)
    .post(verifyJWT, advertisementsController.createNewAdvertisement)
    .patch(verifyJWT, advertisementsController.updateAdvertisement)
    .delete(verifyJWT, advertisementsController.deleteAdvertisement)

router.route('/:id')
    .get(advertisementsController.getAdvertisementById)

router.route('/user/:id')
    .get(advertisementsController.getUserAdvertisements)

module.exports = router
