const PuppyPropose = require('../models/PuppyPropose')
const Dog = require('../models/Dog')
const Litter = require('../models/Litter')

// @desc Get all puppy proposals
// @route GET /puppyproposes
// @access Private
const getAllPuppyProposes = async (req, res) => {
    const puppyProposes = await PuppyPropose.find().lean()
    res.json(puppyProposes)
}

// @desc Create new puppy proposal
// @route POST /puppyproposes
// @access Private
const createNewPuppyPropose = async (req, res) => {
    const { puppy, litter } = req.body

    // Confirm data
    if (!puppy || !litter) {
        return res.status(400).json({ message: 'Puppy and Litter are required' })
    }

    const proposedPuppy = await Dog.findById(puppy)
    const proposedLitter = await Litter.findById(litter)

    if (!proposedPuppy) {
        return res.status(400).json({ message: `Dog with ID ${proposedPuppy} does not exist` })
    }

    if (!proposedLitter) {
        return res.status(400).json({ message: `Litter with ID ${proposedLitter} does not exist` })
    }

    // See if a proposal has already been made for this dog
    // If it has, delete it, as you shouldn't have proposals for the same puppy
    // For more than one litter
    const proposal = await PuppyPropose.findOne({ "puppy": puppy }).exec()

    if (proposal) await PuppyPropose.findByIdAndDelete(proposal)

    const puppyProposeObject = { puppy, litter }

    // Create and store new puppy proposal
    const puppyPropose = await PuppyPropose.create(puppyProposeObject)

    if (puppyPropose) { //Created
        res.status(201).json({ message: `Puppy proposal with ID ${puppyPropose?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid puppy proposal data received' })
    }
}

// @desc No updating for puppy proposals

// @desc Delete puppy proposal
// @route DELETE /puppyproposes
// @access Private
const deletePuppyPropose = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Puppy Proposal ID Required' })
    }

    const puppyPropose = await PuppyPropose.findById(id).exec()

    if (!puppyPropose) {
        return res.status(400).json({ message: 'Puppy propose not found' })
    }

    const result = await puppyPropose.deleteOne()

    const reply = `Puppy proposal with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllPuppyProposes,
    createNewPuppyPropose,
    deletePuppyPropose
}
