const express = require('express')
const router = express.Router()
const dogProposesController = require('../controllers/dogProposesController')

router.route('/')
    .get(dogProposesController.getAllDogProposes)
    .post(dogProposesController.createNewDogPropose)
    .delete(dogProposesController.deleteDogPropose)

module.exports = router
