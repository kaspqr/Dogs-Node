const User = require('../models/User')
const Dog = require('../models/Dog')
const Litter = require('../models/Litter')
const Advertisement = require('../models/Advertisement')
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
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
    const { username, password, name, email, country, region } = req.body

    // Confirm data
    if (!username?.length || !password?.length || !name?.length || !email?.length || !country?.length) {
        return res.status(400).json({ message: 'All fields except region are required' })
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

    // Create the User object with all the required fields
    const userObject = { username, "password": hashedPassword, name, email, country, roles }

    // If a region was included, add it
    if (region?.length) userObject.region = region

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
    const { id, active, password, name, email, country, region, bio, picture, currentPassword } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'ID is required' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    if (currentPassword?.length) {
        const match = await bcrypt.compare(currentPassword, user.password)

        if (!match) {
            return res.status(401).json({ message: 'Incorrect Current Password' })
        }
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

    if (typeof active === 'boolean') {
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

    if (country?.length) {
        user.country = country
    }

    if (region?.length) {
        user.region = region
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
    const { id, currentPassword } = req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    if (currentPassword?.length) {
        const match = await bcrypt.compare(currentPassword, user.password)

        if (!match) {
            return res.status(401).json({ message: 'Incorrect Current Password' })
        }
    }

    const dogs = await Dog.find({ "user": id }).lean().exec()
    const advertisements = await Advertisement.find({ "poster": id }).lean().exec()
    const receiverConversations = await Conversation.find({ "receiver": id }).lean().exec()
    const senderConversations = await Conversation.find({ "sender": id }).lean().exec()

    // Find all conversations associated with user
    if (receiverConversations?.length) {

        for (const convo of receiverConversations) {

            // Find all the messages for each conversation
            const messages = await Message.find({ "conversation": convo }).lean().exec()

            if (messages) {

                // Delete messages
                for (const message of messages) {
                    await Message.findByIdAndDelete(message)
                }
            }

            // Delete conversation
            await Conversation.findByIdAndDelete(convo)
        }
    }

    // Same as above, if the user is the conversation's "sender" instead of "receiver"
    if (senderConversations?.length) {
        for (const convo of senderConversations) {
            const messages = await Message.find({ "conversation": convo }).lean().exec()
            if (messages) {
                for (const message of messages) {
                    await Message.findByIdAndDelete(message)
                }
            }
            await Conversation.findByIdAndDelete(convo)
        }
    }


    if (advertisements?.length) {

        // Delete all advertisements posted by the user
        for (const ad of advertisements) {
            await Advertisement.findByIdAndDelete(ad)
        }
    }


    // For each of the user's dogs
    if (dogs?.length) {
        for (const dog of dogs) {

            if (dog.female === true) {

                // Check if the dog has a litter in the database
                const litters = await Litter.find({ "mother": id }).lean().exec()

                if (litters) {

                    for (const litter of litters) {

                        // Find all the dogs of each litter
                        const litterdogs = await Dog.find({ "litter": litter }).lean().exec()

                        // Set the dogs' litter to null, as the litter will no longer exist
                        for (const dog of litterdogs) {
                            dog.litter = null
                            const updatedDog = await Dog.findByIdAndUpdate(dog._id, dog, { new: true }).lean().exec()
                            console.log(`removed litter from dog ${updatedDog._id}`)
                        }

                        // Delete the litter
                        await Litter.findByIdAndDelete(litter)
                    }
                }
            } else {

                // If the dog is male, find all the litters where the dog is marked as the litter's father
                const litters = await Litter.find({ "father": id }).lean().exec()

                if (litters) {

                    // Set the litters' father to null, as the dog will no longer exist
                    for (const litter of litters) {
                        litter.father = null
                        await Litter.findByIdAndUpdate(litter._id, litter, { new: true }).lean().exec()

                        // Delete the litter
                        await Litter.findByIdAndDelete(litter)
                    }
                }
            }

            // Delete the dog
            await Dog.findByIdAndDelete(dog)
        }
    }

    // Finally, delete the user
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
