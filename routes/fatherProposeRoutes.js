const express = require('express')
const router = express.Router()
const fatherProposesController = require('../controllers/fatherProposesController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .post(verifyJWT, fatherProposesController.createNewFatherPropose)
    .delete(verifyJWT, fatherProposesController.deleteFatherPropose)

router.route('/:id')
    .get(fatherProposesController.getFatherProposalsByLitterId)

module.exports = router
