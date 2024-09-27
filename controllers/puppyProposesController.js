const PuppyPropose = require('../models/PuppyPropose')
const Dog = require('../models/Dog')
const Litter = require('../models/Litter')

const getPuppyProposesByLitterId = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: `ID is required` })

    const litter = await Litter.findOne({ _id: id })
    if (!litter) return res.status(400).json({ message: `Litter does not exist` })

    const proposals = await PuppyPropose.find({ litter: id })

    res.json(proposals)
}

const getUserPuppyProposes = async (req, res) => {
    const { id } = req.params

    const userDogs = await Dog.find({ user: id }).lean()

    const puppyProposalsMadeByUser = (await Promise.all(
        userDogs.map(async (dog) => {
            const hasPuppyProposal = await PuppyPropose.find({ puppy: dog._id }).lean();
            return { dog, hasPuppyProposal: hasPuppyProposal.length > 0 };
        })
    )).filter(result => result.hasPuppyProposal).map(result => result.dog);

    res.json(puppyProposalsMadeByUser)
}

const createNewPuppyPropose = async (req, res) => {
    const { puppy, litter, tokenUserId } = req.body

    if (!puppy || !litter) return res.status(400).json({ message: 'Puppy and Litter are required' })

    const proposedPuppy = await Dog.findById(puppy).lean()
    const proposedLitter = await Litter.findById(litter).lean()

    if (!proposedPuppy) return res.status(400).json({ message: `Dog with ID ${puppy} does not exist` })
    if (!proposedLitter) return res.status(400).json({ message: `Litter with ID ${litter} does not exist` })

    if (proposedPuppy.user.toString() !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    const motherDog = await Dog.findOne({ _id: proposedLitter.mother }).lean()
    if (!motherDog) return res.status(400).json({ message: `Litter does not have a mother` })

    if (motherDog.user.toString() === tokenUserId) return res.status(400).json({ message: `User already owns the litter` })

    await PuppyPropose.findOneAndDelete({ puppy })

    const puppyProposeObject = { puppy, litter }

    const puppyPropose = await PuppyPropose.create(puppyProposeObject)

    if (puppyPropose) {
        res.status(201).json({ message: `Puppy proposal with ID ${puppyPropose?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid puppy proposal data received' })
    }
}

const deletePuppyPropose = async (req, res) => {
    const { id, tokenUserId } = req.body

    if (!id) return res.status(400).json({ message: 'Puppy Proposal ID Required' })

    const puppyPropose = await PuppyPropose.findById(id).exec()
    if (!puppyPropose) return res.status(400).json({ message: 'Puppy propose not found' })

    const puppyDog = await Dog.find({ _id: puppyPropose.puppy })
    if (!puppyDog) return res.status(400).json({ message: 'Dog not found' })

    if (puppyDog.user.toString() !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    const result = await puppyPropose.deleteOne()

    const reply = `Puppy proposal with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getPuppyProposesByLitterId,
    getUserPuppyProposes,
    createNewPuppyPropose,
    deletePuppyPropose
}
