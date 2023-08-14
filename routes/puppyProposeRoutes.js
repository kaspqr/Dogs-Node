const express = require('express')
const router = express.Router()
const puppyProposesController = require('../controllers/puppyProposesController')

router.route('/')
    .get(puppyProposesController.getAllPuppyProposes)
    .post(puppyProposesController.createNewPuppyPropose)
    .delete(puppyProposesController.deletePuppyPropose)

module.exports = router
