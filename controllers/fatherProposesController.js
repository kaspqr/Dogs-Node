const FatherPropose = require('../models/FatherPropose')
const Dog = require('../models/Dog')
const Litter = require('../models/Litter')

// @desc Get all father proposals
// @route GET /fatherproposes
// @access Private
const getAllFatherProposes = async (req, res) => {
    const fatherProposes = await FatherPropose.find().lean()
    /* if (!fatherProposes?.length) {
        return res.status(400).json({ message: 'No father proposals found' })
    } */
    res.json(fatherProposes)
}

// @desc Create new father proposal
// @route POST /fatherproposes
// @access Private
const createNewFatherPropose = async (req, res) => {
    const { father, litter } = req.body

    // Confirm data
    if (!father || !litter) {
        return res.status(400).json({ message: 'Father and Litter are required' })
    }

    const proposedFather = await Dog.findById(father)
    const proposedLitter = await Litter.findById(litter)

    if (!proposedFather) {
        return res.status(400).json({ message: `Dog with ID ${proposedFather} does not exist` })
    }

    if (!proposedLitter) {
        return res.status(400).json({ message: `Litter with ID ${proposedLitter} does not exist` })
    }

    const proposal = await FatherPropose.findOne({ "father": father }).lean().exec()

    if (proposal) await FatherPropose.findByIdAndDelete(proposal)

    const fatherProposeObject = { father, litter }

    // Create and store new advertisement report
    const fatherPropose = await FatherPropose.create(fatherProposeObject)

    if (fatherPropose) { //Created
        res.status(201).json({ message: `Father proposal with ID ${fatherPropose?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid father proposal data received' })
    }
}

// @desc No updating for father proposals

// @desc Delete father proposal
// @route DELETE /fatherproposes
// @access Private
const deleteFatherPropose = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Father Proposal ID Required' })
    }

    const fatherPropose = await FatherPropose.findById(id).exec()

    if (!fatherPropose) {
        return res.status(400).json({ message: 'Father propose not found' })
    }

    const result = await fatherPropose.deleteOne()

    const reply = `Father proposal with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllFatherProposes,
    createNewFatherPropose,
    deleteFatherPropose
}
