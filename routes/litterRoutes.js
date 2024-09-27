const express = require('express')
const router = express.Router()
const littersController = require('../controllers/littersController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(littersController.getLitters)
    .post(verifyJWT, littersController.createNewLitter)
    .patch(verifyJWT, littersController.updateLitter)
    .delete(verifyJWT, littersController.deleteLitter)

router.route('/:id')
    .get(littersController.getLitterById)

router.route('/dog/:id')
    .get(littersController.getDogLitters)

module.exports = router
