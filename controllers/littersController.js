const Litter = require('../models/Litter')
const Dog = require('../models/Dog')

// @desc Get all litters
// @route GET /litters
// @access Private
const getAllLitters = async (req, res) => {
    const litters = await Litter.find().lean()
    if (!litters?.length) {
        return res.status(400).json({ message: 'No litters found' })
    }
    res.json(litters)
}

// @desc Create new litter
// @route POST /litters
// @access Private
const createNewLitter = async (req, res) => {
    const { mother, born, children, breed } = req.body

    // Confirm data
    if (!mother || !born || !children || !breed) {
        return res.status(400).json({ message: 'Mother, breed, date of birth and amount of children is required' })
    }

    const isFemale = await Dog.findById(mother)

    if (!isFemale) {
        return res.status(400).json({ message: `Dog with ID ${mother} does not exist` })
    }

    if (isFemale.female !== true) {
        return res.status(400).json({ message: `Dog with ID ${mother} is not female` })
    }

    const litterObject = { mother, born, children, breed }

    // Create and store new litter
    const litter = await Litter.create(litterObject)

    if (litter) { //Created
        res.status(201).json({ message: `Female dog ${mother}'s new litter with ID ${litter?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid litter data received' })
    }
}

// @desc Update litter
// @route PATCH /litters
// @access Private
const updateLitter = async (req, res) => {
    const { id, father } = req.body

    // Confirm data
    if (!id || !father) {
        return res.status(400).json({ message: 'Litter ID and father required' })
    }

    const dog = await Dog.findById(father).exec()

    if (!dog) {
        return res.status(400).json({ message: `Dog with id ${dog} doesn't exist` })
    }

    if (dog?.female !== false) {
        return res.status(400).json({ message: `Dog with id ${dog} is not male` })
    }

    const litter = await Litter.findById(id).exec()

    if (!litter) {
        return res.status(400).json({ message: 'Litter not found' })
    }

    litter.father = father

    const updatedLitter = await litter.save()

    res.json({ message: `Litter ${updatedLitter?.title} with ID ${id} updated` })
}

// @desc Delete litter
// @route DELETE /litters
// @access Private
const deleteLitter = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Litter ID Required' })
    }

    const litter = await Litter.findById(id).exec()

    if (!litter) {
        return res.status(400).json({ message: 'Litter not found' })
    }

    const dogs = await Dog.find({ "litter": id }).lean().exec()

    for (const dog of dogs) {
        dog.litter = null
        const updatedDog = await Dog.findByIdAndUpdate(dog._id, dog, { new: true }).lean().exec()
        console.log(`removed litter from dog ${updatedDog._id}`)
    }

    const result = await litter.deleteOne()

    const reply = `Litter with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllLitters,
    createNewLitter,
    updateLitter,
    deleteLitter
}
