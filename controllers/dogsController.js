const Litter = require('../models/Litter')
const Dog = require('../models/Dog')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all dogs
// @route GET /dogs
// @access Private
const getAllDogs = asyncHandler(async (req, res) => {
    const dogs = await Dog.find().lean()
    if (!dogs?.length) {
        return res.status(400).json({ message: 'No dogs found' })
    }
    res.json(dogs)
})

// @desc Create new dog
// @route POST /dogs
// @access Private
const createNewDog = asyncHandler(async (req, res) => {
    const { user, owner, mother, father, female, location, litter, heat, sterilized, birth, death, name, breed, info, microchipped, chipnumber, passport } = req.body

    // Confirm data
    if (!user || typeof female !== 'boolean' || !breed) {
        return res.status(400).json({ message: 'Administrative user, breed and gender is required' })
    }

    const administrativeUser = await User.findById(user)

    if (!administrativeUser) {
        return res.status(400).json({ message: 'Administrative user not found' })
    }

    const dogObject = { user, female, breed }

    if (owner) {
        dogObject.owner = owner
    }

    if (mother) {
        dogObject.mother = mother
    }

    if (father) {
        dogObject.father = father
    }

    if (location) {
        dogObject.location = location
    }

    if (litter) {
        dogObject.litter = litter
    }

    if (typeof heat === 'boolean') {
        dogObject.heat = heat
    }

    if (typeof sterilized === 'boolean') {
        dogObject.sterilized = sterilized
    }

    if (birth) {
        dogObject.birth = birth
    }

    if (death) {
        dogObject.death = death
    }

    if (name) {
        dogObject.name = name
    }

    if (breed) {
        dogObject.breed = breed
    }

    if (info) {
        dogObject.info = info
    }

    if (typeof microchipped === 'boolean') {
        dogObject.microchipped = microchipped
    }

    if (chipnumber) {
        dogObject.chipnumber = chipnumber
    }

    if (typeof passport === 'boolean') {
        dogObject.passport = passport
    }

    // Create and store new user
    const dog = await Dog.create(dogObject)

    if (dog) { //Created
        res.status(201).json({ message: `New dog with id ${dog.id} created by user id ${user}` })
    } else {
        res.status(400).json({ message: 'Invalid dog data received' })
    }
})

// @desc Update dog
// @route PATCH /dogs
// @access Private
const updateDog = asyncHandler(async (req, res) => {
    const { id, user, owner, mother, father, location, litter, heat, sterilized, birth, death, name, breed, info, active, microchipped, chipnumber, passport } = req.body

    // Confirm data
    if (!id || !user || !breed || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'ID, administrative user ID, gender, breed and active status is required' })
    }

    const dog = await Dog.findById(id).exec()

    if (!dog) {
        return res.status(400).json({ message: 'Dog not found' })
    }

    dog.user = user
    dog.active = active
    dog.breed = breed

    if (owner) {
        dog.owner = owner
    }

    if (mother) {
        dog.mother = mother
    }

    if (father) {
        dog.father = father
    }

    if (location) {
        dog.location = location
    }

    if (litter) {
        dog.litter = litter
    }

    if (heat) {
        dog.heat = heat
    }

    if (sterilized) {
        dog.sterilized = sterilized
    }

    if (birth) {
        dog.birth = birth
    }

    if (death) {
        dog.death = death
    }

    if (name) {
        dog.name = name
    }

    if (info) {
        dog.info = info
    }

    if (microchipped) {
        dog.microchipped = microchipped
    }

    if (chipnumber) {
        dog.chipnumber = chipnumber
    }

    if (passport) {
        dog.passport = passport
    }

    await dog.save()

    res.json({ message: `Dog with an ID of ${id} has been updated` })
})

// @desc Delete dog 
// @route DELETE /dogs
// @access Private
const deleteDog = asyncHandler(async (req, res) => {
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
    if (litters.length) {
        litters.delete()
    }

    const result = await dog.deleteOne()

    const reply = `Dog with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllDogs,
    createNewDog,
    updateDog,
    deleteDog
}
