const DogPropose = require('../models/DogPropose')
const Dog = require('../models/Dog')
const User = require('../models/User')

const getProposedDogs = async (req, res) => {
    const { user } = req.params
    const { tokenUserId } = req.body

    if (!user || !tokenUserId) return res.status(400).json({ message: 'User ID and token ID are required' })

    if (user !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    const foundUser = User.find({ _id: user }).lean()
    if (!foundUser) return res.status(400).json({ message: 'User not found' })

    const dogProposes = await DogPropose.find({ user }).lean()

    const proposedDogIds = dogProposes.map((proposal) => proposal.dog)

    const proposedDogs = await Promise.all(
        proposedDogIds.map(async (id) => await Dog.findOne({ _id: id }).lean())
    );

    res.json(proposedDogs)
}

const getUserDogProposals = async (req, res) => {
    const { user } = req.params
    const { tokenUserId } = req.body

    if (!user || !tokenUserId) return res.status(400).json({ message: 'User ID and token ID are required' })

    if (user !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    const foundUser = User.find({ _id: user }).lean()
    if (!foundUser) return res.status(400).json({ message: 'User not found' })

    const dogProposes = await DogPropose.find({ user }).lean()

    res.json(dogProposes)
}

const createNewDogPropose = async (req, res) => {
    const { dog, user, tokenUserId } = req.body

    if (!dog || !user) return res.status(400).json({ message: 'Dog and User are required' })
    if (user === tokenUserId) return res.status(400).json({ message: 'Cannot propose a dog to yourself' })

    const proposedDog = await Dog.findById(dog)
    const proposedUser = await User.findById(user)

    if (!proposedDog) {
        return res.status(400).json({ message: `Dog with ID ${proposedDog} does not exist` })
    }

    if (!proposedUser) {
        return res.status(400).json({ message: `User with ID ${proposedUser} does not exist` })
    }

    if (proposedDog.user.toString() !== tokenUserId) return res.status(401).json({ message: `Unauthorized` })

    await DogPropose.findOneAndDelete({ dog }).exec()

    const dogProposeObject = { dog, user }

    const dogPropose = await DogPropose.create(dogProposeObject)

    if (dogPropose) {
        res.status(201).json({ message: `Dog proposal with ID ${dogPropose?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid dog proposal data received' })
    }
}

const deleteDogPropose = async (req, res) => {
    const { id, tokenUserId } = req.body

    if (!id) return res.status(400).json({ message: 'Dog Proposal ID Required' })

    const dogProposal = await DogPropose.findById(id).exec()
    if (!dogProposal) return res.status(400).json({ message: 'Dog Proposal not found' })

    const dog = await Dog.find({ _id: dogProposal.dog })
    if (!dog) return res.status(400).json({ message: 'Dog not found' })

    if (dog.user.toString() !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    const result = await DogPropose.deleteOne()

    const reply = `Dog proposal with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getProposedDogs,
    getUserDogProposals,
    createNewDogPropose,
    deleteDogPropose
}
