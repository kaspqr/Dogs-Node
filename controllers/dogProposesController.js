const DogPropose = require('../models/DogPropose')
const Dog = require('../models/Dog')
const User = require('../models/User')

// @desc Get all dog proposals
// @route GET /dogproposes
// @access Private
const getAllDogProposes = async (req, res) => {
    const dogProposes = await DogPropose.find().lean()
    res.json(dogProposes)
}

// @desc Create new dog proposal
// @route POST /dogproposes
// @access Private
const createNewDogPropose = async (req, res) => {
    const { dog, user } = req.body

    // Confirm data
    if (!dog || !user) {
        return res.status(400).json({ message: 'Dog and User are required' })
    }

    const proposedDog = await Dog.findById(dog)
    const proposedUser = await User.findById(user)

    if (!proposedDog) {
        return res.status(400).json({ message: `Dog with ID ${proposedDog} does not exist` })
    }

    if (!proposedUser) {
        return res.status(400).json({ message: `User with ID ${proposedUser} does not exist` })
    }

    // See if a proposal has already been made for this dog
    // If it has, delete it, as you shouldn't have proposals for the same dog
    // To more than one user
    const proposal = await DogPropose.findOne({ "dog": dog }).exec()

    if (proposal) await DogPropose.findByIdAndDelete(proposal)

    const dogProposeObject = { dog, user }

    // Create and store new advertisement report
    const dogPropose = await DogPropose.create(dogProposeObject)

    if (dogPropose) { //Created
        res.status(201).json({ message: `Dog proposal with ID ${dogPropose?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid dog proposal data received' })
    }
}

// @desc No updating for dog proposals

// @desc Delete dog proposal
// @route DELETE /dogproposes
// @access Private
const deleteDogPropose = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Dog Proposal ID Required' })
    }

    const dogPropose = await DogPropose.findById(id).exec()

    if (!dogPropose) {
        return res.status(400).json({ message: 'Dog propose not found' })
    }

    const result = await dogPropose.deleteOne()

    const reply = `Dog proposal with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllDogProposes,
    createNewDogPropose,
    deleteDogPropose
}
