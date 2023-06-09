const Dog = require('../models/Dog')
const DogPicture = require('../models/DogPicture')
const asyncHandler = require('express-async-handler')

// @desc Get all dog pictures
// @route GET /dogpictures
// @access Private
const getAllDogPictures = asyncHandler(async (req, res) => {
    const dogPictures = await DogPicture.find().lean()
    if (!dogPictures?.length) {
        return res.status(400).json({ message: 'No dog pictures found' })
    }
    res.json(dogPictures)
})

// @desc Create new dog picture
// @route POST /dogpictures
// @access Private
const createNewDogPicture = asyncHandler(async (req, res) => {
    const { dog, picture } = req.body

    // Confirm data
    if (!dog || !picture.length) {
        return res.status(400).json({ message: 'Dog and picture is required' })
    }

    const relatedDog = await Dog.findById(dog)

    if (!relatedDog) {
        return res.status(400).json({ message: `Dog with ID ${dog} does not exist` })
    }

    const dogPictureObject = { dog, picture }

    // Create and store new dog picture
    const dogPicture = await DogPicture.create(dogPictureObject)

    if (dogPicture) { //Created
        res.status(201).json({ message: `Dog picture with ID ${dogPicture.id} created for dog ${dog}` })
    } else {
        res.status(400).json({ message: 'Invalid dog picture data received' })
    }
})

// @desc No updating for dog pictures

// @desc Delete dog picture
// @route DELETE /dogpictures
// @access Private
const deleteDogPicture = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Dog picture ID Required' })
    }

    const dogPicture = await DogPicture.findById(id).exec()

    if (!dogPicture) {
        return res.status(400).json({ message: 'Dog picture not found' })
    }

    const result = await dogPicture.deleteOne()

    const reply = `Dog picture with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllDogPictures,
    createNewDogPicture,
    deleteDogPicture
}
