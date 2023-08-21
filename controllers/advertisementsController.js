const User = require('../models/User')
const Advertisement = require('../models/Advertisement')

// @desc Get all advertisements
// @route GET /advertisements
// @access Private
const getAllAdvertisements = async (req, res) => {
    const advertisements = await Advertisement.find().lean()
    res.json(advertisements)
}

// @desc Create new advertisement
// @route POST /advertisements
// @access Private
const createNewAdvertisement = async (req, res) => {
    const { premium, poster, title, type, price, info, currency, country, region } = req.body

    // Confirm data
    if (!poster || !title || !type || !country) {
        return res.status(400).json({ message: 'Premium, poster, title, type, country and price is required' })
    }

    const validPoster = await User.findById(poster).select('-password').exec()

    if (!validPoster) {
        return res.status(400).json({ message: `Poster with ID ${poster} not found` })
    }

    if (validPoster?.active !== true) {
        return res.status(400).json({ message: `Poster with ID ${poster} is banned` })
    }

    const advertisementObject = { poster, title, type, country }

    if (typeof info === 'string' && info?.length) {
        advertisementObject.info = info
    }

    if (typeof premium === 'boolean') {
        advertisementObject.premium = premium
    }

    if (price?.length) {
        advertisementObject.price = price
    }

    if (currency?.length) {
        advertisementObject.currency = currency
    }

    if (region?.length) {
        advertisementObject.region = region
    }

    // Create and store new advertisement
    const advertisement = await Advertisement.create(advertisementObject)

    if (advertisement) { //Created
        res.status(201).json({ message: `New advertisement ${title} with ID ${advertisement?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid advertisement data received' })
    }
}

// @desc Update advertisement
// @route PATCH /advertisements
// @access Private
const updateAdvertisement = async (req, res) => {
    const { id, premium, title, type, price, info, active, currency, country, region, image } = req.body

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

    if (country) {
        advertisement.country = country
    }

    if (region?.length) {
        advertisement.region = region
    } else {
        advertisement.region = ''
    }

    if (price) {
        advertisement.price = price
    }

    if (currency) {
        advertisement.currency = currency
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

    if (image?.length) {
        if (image === 'none ') {
            advertisement.image = null
        } else {
            advertisement.image = image
        }
    }

    const updatedAdvertisement = await advertisement.save()

    res.json({ message: `Advertisement ${updatedAdvertisement?.title} with ID ${id} updated` })
}

// @desc Delete advertisement
// @route DELETE /advertisements
// @access Private
const deleteAdvertisement = async (req, res) => {
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
}

module.exports = {
    getAllAdvertisements,
    createNewAdvertisement,
    updateAdvertisement,
    deleteAdvertisement
}
