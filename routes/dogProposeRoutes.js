const express = require('express')
const router = express.Router()
const dogProposesController = require('../controllers/dogProposesController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .post(verifyJWT, dogProposesController.createNewDogPropose)
    .delete(verifyJWT, dogProposesController.deleteDogPropose)

router.route('/:user')
    .get(verifyJWT, dogProposesController.getUserDogProposals)

router.route('/proposeddogs/:user')
    .get(verifyJWT, dogProposesController.getProposedDogs)

module.exports = router
