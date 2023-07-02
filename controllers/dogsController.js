const Litter = require('../models/Litter')
const Dog = require('../models/Dog')
const User = require('../models/User')

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
    const { user, owner, mother, father, female, location, litter, heat, sterilized, birth, death, name, breed, info, microchipped, chipnumber, passport } = req.body

    // Confirm data
    if (!user || typeof female !== 'boolean' || !breed || !birth) {
        return res.status(400).json({ message: 'Administrative user, breed and gender is required' })
    }

    const administrativeUser = await User.findById(user)

    if (!administrativeUser) {
        return res.status(400).json({ message: 'Administrative user not found' })
    }

    const dogObject = { user, female, breed, birth }

    if (owner?.length) {
        dogObject.owner = owner
    }

    if (mother?.length) {
        dogObject.mother = mother
    }

    if (father?.length) {
        dogObject.father = father
    }

    if (location?.length) {
        dogObject.location = location
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
    const { id, instagram, facebook, youtube, tiktok, user, owner, location, litter, heat, sterilized, death, info, active, microchipped, chipnumber, passport } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'ID is required' })
    }

    const dog = await Dog.findById(id).exec()

    if (!dog) {
        return res.status(400).json({ message: 'Dog not found' })
    }


    if (user?.length) {
        dog.user = user
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

    if (owner?.length) {
        dog.owner = owner
    }

    if (location?.length) {
        dog.location = location
    }

    if (litter?.length) {
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

    // Check if the dog has a litter in the database
    const litters = await Litter.find({ "mother": id }).lean().exec()

    if (!dog) {
        return res.status(400).json({ message: 'Dog not found' })
    }

    // If the dog did have a litter, delete the litter also
    if (litters?.length) {
        litters.delete()
    }

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
