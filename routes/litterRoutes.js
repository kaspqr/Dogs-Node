const express = require('express')
const router = express.Router()
const littersController = require('../controllers/littersController')

router.route('/')
    .get(littersController.getAllLitters)
    .post(littersController.createNewLitter)
    .delete(littersController.deleteLitter)

module.exports = router
