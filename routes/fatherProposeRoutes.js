const express = require('express')
const router = express.Router()
const fatherProposesController = require('../controllers/fatherProposesController')

router.route('/')
    .get(fatherProposesController.getAllFatherProposes)
    .post(fatherProposesController.createNewFatherPropose)
    .delete(fatherProposesController.deleteFatherPropose)

module.exports = router
