const express = require('express')
const router = express.Router()
const puppyProposesController = require('../controllers/puppyProposesController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .post(verifyJWT, puppyProposesController.createNewPuppyPropose)
    .delete(verifyJWT, puppyProposesController.deletePuppyPropose)

router.route('/:id')
    .get(puppyProposesController.getPuppyProposesByLitterId)

router.route('/user/:id')
    .get(puppyProposesController.getUserPuppyProposes)

module.exports = router
