const User = require('../models/User')
const Advertisement = require('../models/Advertisement')
const asyncHandler = require('express-async-handler')

// @desc Get all advertisements
// @route GET /advertisements
// @access Private
const getAllAdvertisements = asyncHandler(async (req, res) => {
    const advertisements = await Advertisement.find().lean()
    if (!advertisements?.length) {
        return res.status(400).json({ message: 'No advertisements found' })
    }
    res.json(advertisements)
})

// @desc Create new advertisement
// @route POST /advertisements
// @access Private
const createNewAdvertisement = asyncHandler(async (req, res) => {
    const { premium, poster, title, type, price, info } = req.body

    // Confirm data
    if (typeof premium !== 'boolean' || !poster || !title || !type || !price) {
        return res.status(400).json({ message: 'Premium, poster, title, type and price is required' })
    }

    const advertisementObject = { premium, poster, title, type, price }

    if (typeof info === 'string' && info?.length) {
        advertisementObject.info = info
    }

    // Create and store new advertisement
    const advertisement = await Advertisement.create(advertisementObject)

    if (advertisement) { //Created
        res.status(201).json({ message: `New advertisement ${title} with ID ${advertisement?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid advertisement data received' })
    }
})

// @desc Update advertisement
// @route PATCH /advertisements
// @access Private
const updateAdvertisement = asyncHandler(async (req, res) => {
    const { id, premium, title, type, price, info, active } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Advertisement ID required' })
    }

    const advertisement = await Advertisement.findById(id).exec()

    if (!advertisement) {
        return res.status(400).json({ message: 'Advertisement not found' })
    }

    if (typeof premium === 'boolean') {
        advertisement.premium = premium
    }

    if (title) {
        advertisement.title = title
    }

    if (price) {
        advertisement.price = price
    }

    if (info) {
        advertisement.info = info
    }

    if (type) {
        advertisement.type = type
    }

    if (typeof active === 'boolean') {
        advertisement.active = active
    }

    const updatedAdvertisement = await advertisement.save()

    res.json({ message: `Advertisement ${updatedAdvertisement?.title} with ID ${id} updated` })
})

// @desc Delete advertisement
// @route DELETE /advertisements
// @access Private
const deleteAdvertisement = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Advertisement ID Required' })
    }

    const advertisement = await Advertisement.findById(id).exec()

    if (!advertisement) {
        return res.status(400).json({ message: 'Advertisement not found' })
    }

    const result = await advertisement.deleteOne()

    const reply = `Advertisement ${result.title} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllAdvertisements,
    createNewAdvertisement,
    updateAdvertisement,
    deleteAdvertisement
}
