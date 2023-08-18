const Litter = require('../models/Litter')
const Dog = require('../models/Dog')
const User = require('../models/User')
const PuppyPropose = require('../models/PuppyPropose')
const FatherPropose = require('../models/FatherPropose')
const DogPropose = require('../models/DogPropose')

// @desc Get all dogs
// @route GET /dogs
// @access Private
const getAllDogs = async (req, res) => {
    const dogs = await Dog.find().lean()
    if (!dogs?.length) {
        return res.status(400).json({ message: 'No dogs found' })
    }
    res.json(dogs)
}

// @desc Create new dog
// @route POST /dogs
// @access Private
const createNewDog = async (req, res) => {
    const { user, female, country, region, litter, heat, 
        sterilized, birth, death, name, breed, info, microchipped, chipnumber, passport } = req.body

    // Confirm data
    if (!user || typeof female !== 'boolean' || !breed || !birth) {
        return res.status(400).json({ message: 'Administrative user, breed and gender is required' })
    }

    const administrativeUser = await User.findById(user)

    if (!administrativeUser) {
        return res.status(400).json({ message: 'Administrative user not found' })
    }

    const dogObject = { user, female, breed, birth }

    if (country?.length) {
        dogObject.country = country
    }

    if (region?.length) {
        dogObject.region = region
    }

    if (litter?.length) {
        dogObject.litter = litter
    }

    if (typeof heat === 'boolean') {
        dogObject.heat = heat
    }

    if (typeof sterilized === 'boolean') {
        dogObject.sterilized = sterilized
    }

    if (death?.length) {
        dogObject.death = death
    }

    if (name?.length) {
        dogObject.name = name
    }

    if (breed?.length) {
        dogObject.breed = breed
    }

    if (info?.length) {
        dogObject.info = info
    }

    if (typeof microchipped === 'boolean') {
        dogObject.microchipped = microchipped
    }

    if (chipnumber?.length) {
        dogObject.chipnumber = chipnumber
    }

    if (typeof passport === 'boolean') {
        dogObject.passport = passport
    }

    dogObject.active = true

    // Create and store new user
    const dog = await Dog.create(dogObject)

    if (dog) { //Created
        res.status(201).json({ message: `New dog with id ${dog?.id} created by user id ${user}` })
    } else {
        res.status(400).json({ message: 'Invalid dog data received' })
    }
}

// @desc Update dog
// @route PATCH /dogs
// @access Private
const updateDog = async (req, res) => {
    const { id, name, instagram, facebook, youtube, tiktok, user, country, region, litter, 
        heat, sterilized, death, info, active, microchipped, chipnumber, passport } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'ID is required' })
    }

    const dog = await Dog.findById(id).exec()

    if (!dog) {
        return res.status(400).json({ message: 'Dog not found' })
    }

    // Changing administrative user
    if (user?.length) {
        const validUser = await User.findById(user).exec()
        if (!validUser) return res.status(400).json({ message: 'User not found' })

        // Delete all proposals made for this dog due to it's administrative user being changed
        const dogProposes = await DogPropose.find({ "dog": id }).lean().exec()
        if (dogProposes) {
            for (const proposal of dogProposes) {
                await DogPropose.findByIdAndDelete(proposal)
            }
        }

        const fatherProposes = await FatherPropose.find({ "father": id }).lean().exec()
        if (fatherProposes) {
            for (const proposal of fatherProposes) {
                await FatherPropose.findByIdAndDelete(proposal)
            }
        }

        const puppyProposes = await PuppyPropose.find({ "puppy": id }).lean().exec()
        if (puppyProposes) {
            for (const proposal of puppyProposes) {
                await PuppyPropose.findByIdAndDelete(proposal)
            }
        }

        dog.user = user
    }

    if (name?.length) {
        dog.name = name
    }

    if (instagram?.length) {
        dog.instagram = instagram
    }

    if (facebook?.length) {
        dog.facebook = facebook
    }

    if (youtube?.length) {
        dog.youtube = youtube
    }

    if (tiktok?.length) {
        dog.tiktok = tiktok
    }

    if (typeof active === 'boolean') {
        dog.active = active
    }

    if (country?.length) {
        dog.country = country
    }

    if (region?.length) {
        dog.region = region
    }

    // Changing the dog's litter
    if (litter?.length) {
        // Delete all puppy proposals as it will now have a litter
        const proposals = await PuppyPropose.find({ "puppy": dog }).lean().exec()
        if (proposals) {
            for (const proposal of proposals) {
                await PuppyPropose.findByIdAndDelete(proposal)
            }
        }
       
        // If the dog was previously also proposed as the father of the litter it is now being added to
        // Delete said proposal
        const fatherProposals = await FatherPropose.find({ "father": dog, "litter": litter }).lean().exec()
        if (fatherProposals) {
            for (const proposal of fatherProposals) {
                await FatherPropose.findByIdAndDelete(proposal)
            }
        }
        
        dog.litter = litter
    }

    if (typeof heat === 'boolean') {
        dog.heat = heat
    }

    if (typeof sterilized === 'boolean') {
        dog.sterilized = sterilized
    }

    if (death?.length) {
        dog.death = death
    }

    if (info?.length) {
        dog.info = info
    }

    if (typeof microchipped === 'boolean') {
        dog.microchipped = microchipped
    }

    if (chipnumber?.length) {
        dog.chipnumber = chipnumber
    }

    if (typeof passport === 'boolean') {
        dog.passport = passport
    }

    await dog.save()

    res.json({ message: `Dog with an ID of ${id} has been updated` })
}

// @desc Delete dog 
// @route DELETE /dogs
// @access Private
const deleteDog = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Dog ID Required' })
    }

    const dog = await Dog.findById(id).exec()

    if (!dog) {
        return res.status(400).json({ message: 'Dog not found' })
    }

    // Check if the dog has a litter in the database
    const litter = await Litter.find({ "mother": id }).lean().exec()

    if (litter) {
        // Get all the dogs that belong to said litter, as the litter will be deleted
        // Meaning of the litter's dogs' litter has to be updated to null
        const dogs = await Dog.find({ "litter": litter }).lean().exec()

        for (const dog of dogs) {
            dog.litter = null
            const updatedDog = await Dog.findByIdAndUpdate(dog._id, dog, { new: true }).lean().exec()
            console.log(`removed litter from dog ${updatedDog._id}`)
        }

        const result = await Litter.findByIdAndDelete(litter)
        console.log(result)
    }

    // Delete all of the dog's proposals
    const dogProposes = await DogPropose.find({ "dog": id }).lean().exec()
    if (dogProposes) {
        for (const proposal of dogProposes) {
            await DogPropose.findByIdAndDelete(proposal)
        }
    }

    const fatherProposes = await FatherPropose.find({ "father": id }).lean().exec()
    if (fatherProposes) {
        for (const proposal of fatherProposes) {
            await FatherPropose.findByIdAndDelete(proposal)
        }
    }

    const puppyProposes = await PuppyPropose.find({ "puppy": id }).lean().exec()
    if (puppyProposes) {
        for (const proposal of puppyProposes) {
            await PuppyPropose.findByIdAndDelete(proposal)
        }
    }

    // Finally, delete the dog
    const result = await dog.deleteOne()

    const reply = `Dog with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllDogs,
    createNewDog,
    updateDog,
    deleteDog
}
