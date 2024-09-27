const express = require('express')
const router = express.Router()
const dogsController = require('../controllers/dogsController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(dogsController.getDogs)
    .post(verifyJWT, dogsController.createNewDog)
    .patch(verifyJWT, dogsController.updateDog)
    .delete(verifyJWT, dogsController.deleteDog)

router.route('/user/:id')
    .get(dogsController.getUserDogs)

router.route('/litter/:id')
    .get(dogsController.getLitterPuppies)

router.route('/:id')
    .get(dogsController.getDogById)

router.route('/proposable/fathers/:userId/:litterId')
    .get(dogsController.getProposableFatherDogs)

router.route('/proposable/puppies/:userId/:litterId')
    .get(dogsController.getProposablePuppies)

router.route('/proposable/dogs/:userId')
    .get(dogsController.getProposableDogs)

module.exports = router
