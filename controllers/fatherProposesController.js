const FatherPropose = require('../models/FatherPropose')
const Dog = require('../models/Dog')
const Litter = require('../models/Litter')

const getFatherProposalsByLitterId = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: `ID is required` })

    const proposals = await FatherPropose.find({ litter: id })

    res.json(proposals)
}

const createNewFatherPropose = async (req, res) => {
    const { father, litter, tokenUserId } = req.body

    if (!father || !litter) {
        return res.status(400).json({ message: 'Father and Litter are required' })
    }

    const proposedFather = await Dog.findById(father)
    const proposedLitter = await Litter.findById(litter)

    if (proposedFather.user.toString() !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    const motherDog = await Dog.find({ _id: proposedLitter.mother })
    if (!motherDog) return res.status(400).json({ message: `Litter does not have a mother` })

    if (motherDog.user === tokenUserId) return res.status(400).json({ message: `User already owns the litter` })

    if (!proposedFather) {
        return res.status(400).json({ message: `Dog with ID ${proposedFather} does not exist` })
    }

    if (!proposedLitter) {
        return res.status(400).json({ message: `Litter with ID ${proposedLitter} does not exist` })
    }

    const proposal = await FatherPropose.findOne({ father }).exec()
    if (proposal) await FatherPropose.findByIdAndDelete(proposal)

    const fatherProposeObject = { father, litter }

    const fatherPropose = await FatherPropose.create(fatherProposeObject)

    if (fatherPropose) {
        res.status(201).json({ message: `Father proposal with ID ${fatherPropose?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid father proposal data received' })
    }
}

const deleteFatherPropose = async (req, res) => {
    const { id, tokenUserId } = req.body

    if (!id) return res.status(400).json({ message: 'Father Proposal ID Required' })

    const fatherPropose = await FatherPropose.findById(id).exec()
    if (!fatherPropose) return res.status(400).json({ message: 'Father propose not found' })

    const fatherDog = await Dog.find({ _id: fatherPropose.father })
    if (!fatherDog) return res.status(400).json({ message: 'Dog not found' })

    if (fatherDog.user.toString() !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    const result = await fatherPropose.deleteOne()

    const reply = `Father proposal with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getFatherProposalsByLitterId,
    createNewFatherPropose,
    deleteFatherPropose
}
