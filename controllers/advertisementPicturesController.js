const Advertisement = require('../models/Advertisement')
const AdvertisementPicture = require('../models/AdvertisementPicture')

// @desc Get all advertisement pictures
// @route GET /advertisementpictures
// @access Private
const getAllAdvertisementPictures = async (req, res) => {
    const advertisementPictures = await AdvertisementPicture.find().lean()
    if (!advertisementPictures?.length) {
        return res.status(400).json({ message: 'No advertisement pictures found' })
    }
    res.json(advertisementPictures)
}

// @desc Create new advertisement picture
// @route POST /advertisementpictures
// @access Private
const createNewAdvertisementPicture = async (req, res) => {
    const { advertisement, picture } = req.body

    // Confirm data
    if (!advertisement || !picture?.length) {
        return res.status(400).json({ message: 'Advertisement and picture is required' })
    }

    const relatedAdvertisement = await Advertisement.findById(advertisement)

    if (!relatedAdvertisement) {
        return res.status(400).json({ message: `Advertisement with ID ${advertisement} does not exist` })
    }

    const advertisementPictureObject = { advertisement, picture }

    // Create and store new advertisement picture
    const advertisementPicture = await AdvertisementPicture.create(advertisementPictureObject)

    if (advertisementPicture) { //Created
        res.status(201).json({ message: `Advertisement picture with ID ${advertisementPicture?.id} created for advertisement ${advertisement}` })
    } else {
        res.status(400).json({ message: 'Invalid advertisement picture data received' })
    }
}

// @desc No updating for advertisement pictures

// @desc Delete advertisement picture
// @route DELETE /advertisementpictures
// @access Private
const deleteAdvertisementPicture = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Advertisement picture ID Required' })
    }

    const advertisementPicture = await AdvertisementPicture.findById(id).exec()

    if (!advertisementPicture) {
        return res.status(400).json({ message: 'Advertisement picture not found' })
    }

    const result = await advertisementPicture.deleteOne()

    const reply = `Advertisement picture with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllAdvertisementPictures,
    createNewAdvertisementPicture,
    deleteAdvertisementPicture
}
