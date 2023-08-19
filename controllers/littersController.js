const Litter = require('../models/Litter')
const Dog = require('../models/Dog')
const FatherPropose = require('../models/FatherPropose')
const PuppyPropose = require('../models/PuppyPropose')

// @desc Get all litters
// @route GET /litters
// @access Private
const getAllLitters = async (req, res) => {
    const litters = await Litter.find().lean()
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
    const { id, father, removeFather } = req.body

    // Confirm data
    if (!id || (!father && !removeFather)) {
        return res.status(400).json({ message: 'Litter ID and either father or remove father required' })
    }

    const litter = await Litter.findById(id).exec()

    if (!litter) {
        return res.status(400).json({ message: 'Litter not found' })
    }

    // Updating the father
    if (father) {
        const dog = await Dog.findById(father).exec()

        if (!dog) {
            return res.status(400).json({ message: `Dog with id ${dog} doesn't exist` })
        }

        if (dog?.female !== false) {
            return res.status(400).json({ message: `Dog with id ${dog} is not male` })
        }

        // Deleting all father proposes made to the litter, since a father has now been chosen
        const fatherProposes = await FatherPropose.find({ "litter": litter }).lean().exec()

        if (fatherProposes) {
            for (const fatherPropose of fatherProposes) {
                await FatherPropose.findByIdAndDelete(fatherPropose)
            }
        }

        // If the father was also proposed as a puppy, the proposal must be deleted
        // As the dog cannot be both the father and the puppy of said litter
        const puppyProposes = await PuppyPropose.find({ "litter": litter, "puppy": father }).lean().exec()

        if (puppyProposes) {
            for (const puppyPropose of puppyProposes) {
                await PuppyPropose.findByIdAndDelete(puppyPropose)
            }
        }

        // Finally, update the father
        litter.father = father
    }

    // If the owner of the litter's mother or the owner of the litter's father wants to remove the father from the litter
    if (removeFather) litter.father = null

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

    // Find all the dogs belonging to the litter and update their litter to null
    const dogs = await Dog.find({ "litter": id }).lean().exec()

    for (const dog of dogs) {
        dog.litter = null
        const updatedDog = await Dog.findByIdAndUpdate(dog._id, dog, { new: true }).lean().exec()
        console.log(`removed litter from dog ${updatedDog._id}`)
    }

    // Delete all proposals made to this litter
    const fatherProposes = await FatherPropose.find({ "litter": litter }).lean().exec()

    if (fatherProposes) {
        for (const fatherPropose of fatherProposes) {
            await FatherPropose.findByIdAndDelete(fatherPropose)
        }
    }

    const puppyProposes = await PuppyPropose.find({ "litter": litter }).lean().exec()

    if (puppyProposes) {
        for (const puppyPropose of puppyProposes) {
            await PuppyPropose.findByIdAndDelete(puppyPropose)
        }
    }

    // Finally, delete the litter
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
