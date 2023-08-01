const User = require('../models/User')
const Dog = require('../models/Dog')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
    const { id } = req.body

    if (id?.length) {
        const user = await User.findById(id).select('-password').exec()
        if (!user) {
            return res.status(400).json({ message: `User with id ${id} not found` })
        }
        res.json(user)
    } else {
        const users = await User.find().select('-password').lean()
        if (!users?.length) {
            return res.status(400).json({ message: 'No users found' })
        }
        res.json(users)
    }
}

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
    const { username, password, name, email, location } = req.body

    // Confirm data
    if (!username?.length || !password?.length || !name?.length || !email?.length || !location?.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicates
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Check for email duplicate
    const emailDuplicate = await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (emailDuplicate) {
        return res.status(409).json({ message: 'Duplicate email' })
    }

    // Add user role
    const roles = ["User"]

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10) // salt rounds

    const userObject = { username, "password": hashedPassword, name, email, location, roles }

    // Create and store new user
    const user = await User.create(userObject)

    if (user) { //Created
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
}

// @desc Update user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
    const { id, active, password, name, email, location, bio, picture } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'ID is required' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for email duplicate
    const emailDuplicate = await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow updates to the original user
    if (email && emailDuplicate && emailDuplicate?._id?.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate email' })
    }

    if (password) {
        // Hash password
        user.password = await bcrypt.hash(password, 10) // salt rounds
    }

    if (typeof active !== 'boolean') {
        user.active = active
    }

    if (bio?.length) {
        user.bio = bio
    }

    if (email?.length) {
        user.email = email
    }

    if (name?.length) {
        user.name = name
    }

    if (location?.length) {
        user.location = location
    }

    if (picture) {
        user.picture = picture
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
}

// @desc Delete user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    const user = await User.findById(id).exec()
    const dogs = await Dog.find({ "user": id }).lean().exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    if (dogs?.length) {
        dogs.delete()
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
