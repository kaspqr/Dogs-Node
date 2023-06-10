const Litter = require('../models/Litter')
const Dog = require('../models/Dog')
const asyncHandler = require('express-async-handler')

// @desc Get all litters
// @route GET /litters
// @access Private
const getAllLitters = asyncHandler(async (req, res) => {
    const litters = await Litter.find().lean()
    if (!litters?.length) {
        return res.status(400).json({ message: 'No litters found' })
    }
    res.json(litters)
})

// @desc Create new litter
// @route POST /litters
// @access Private
const createNewLitter = asyncHandler(async (req, res) => {
    const { mother } = req.body

    // Confirm data
    if (!mother) {
        return res.status(400).json({ message: 'Mother of the litter is required' })
    }

    const isFemale = await Dog.findById(mother)

    if (!isFemale) {
        return res.status(400).json({ message: `Dog with ID ${mother} does not exist` })
    }

    if (isFemale.female !== true) {
        return res.status(400).json({ message: `Dog with ID ${mother} is not female` })
    }

    const litterObject = { mother }

    // Create and store new litter
    const litter = await Litter.create(litterObject)

    if (litter) { //Created
        res.status(201).json({ message: `Female dog ${mother}'s new litter with ID ${litter?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid litter data received' })
    }
})

// @desc No updating for litters

// @desc Delete litter
// @route DELETE /litters
// @access Private
const deleteLitter = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Litter ID Required' })
    }

    const litter = await Litter.findById(id).exec()

    if (!litter) {
        return res.status(400).json({ message: 'Litter not found' })
    }

    const result = await litter.deleteOne()

    const reply = `Litter with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllLitters,
    createNewLitter,
    deleteLitter
}
