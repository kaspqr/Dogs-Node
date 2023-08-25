const User = require('../models/User')
const Dog = require('../models/Dog')
const Litter = require('../models/Litter')
const Advertisement = require('../models/Advertisement')
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const DogPropose = require('../models/DogPropose')
const FatherPropose = require('../models/FatherPropose')
const PuppyPropose = require('../models/PuppyPropose')
const bcrypt = require('bcrypt')

const Token = require('../models/Token')
const ResetToken = require('../models/ResetToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

// @desc Email verification
// @route GET /users/:id/verify/:token
// @access Pricate
const verifyEmail = async (req, res) => {
    try {
        const userId = req.params.id
        const tokenId = req.params.token

        const user = await User.findById(userId)
        if (!user) return res.status(400).send({ message: "Invalid Link" })

        console.log(userId)

        const token = await Token.findOne({ 
            user: userId,
            token: tokenId
        })

        if (!token) return res.status(400).send({ message: "Invalid Link" })

        user.verified = true

        await user.save()

        await token.deleteOne()

        res.status(200).send({ message: 'Email Verified Successfully' })

    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
        console.log(error)
    }
}

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
        res.json(users)
    }
}

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {
    const { username, password, name, email, country, region, bio } = req.body

    // Confirm data
    if (!username?.length || !password?.length || !name?.length || !email?.length || !country?.length) {
        return res.status(400).json({ message: 'All fields except region and bio are required' })
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

    // If a region was included, add it
    if (bio?.length) userObject.bio = bio

    // Create and store new user
    const user = await User.create(userObject)

    if (user) { //Created
        const token = await Token.create({ // For email verification
            user: user._id,
            token: crypto.randomBytes(32).toString('hex')
        })

        const url = `${process.env.BASE_URL}users/${user?._id}/verify/${token?.token}`

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid #e0e0e0;
                        border-radius: 5px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #007bff;
                        color: white;
                        text-align: center;
                        padding: 10px;
                        border-top-left-radius: 5px;
                        border-top-right-radius: 5px;
                    }
                    .content {
                        padding: 20px;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    .button-text {
                        color: white;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <p>Thank you for signing up! To verify your email address, please click the button below:</p>
                        <a class="button" href="${url}">
                            <b class="button-text">Verify Email</b>
                        </a>
                        <p>If the verification button does not work, please go to the link below</p>
                        <p>If you didn't sign up for this, you can safely ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
            <noscript>
                Verification Link:
                ${url}
            </noscript>
        `

        sendEmail(user?.email, 'Verify Email', html)

        res.status(201).json({ message: `New user ${username} created` })

    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
}

// @desc Update user password
// @route POST /users/resetpassword
// @access Private
const resetPassword = async (req, res) => {

    const { id, password } = req.body

    console.log(req.body)

    // Confirm data
    if (!id || !password) res.status(400).json({ message: 'ID and password is required' })

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Hash password
    user.password = await bcrypt.hash(password, 10) // salt rounds

    await user.save()

    const resetToken = await ResetToken.findOne({ user: id }).lean().exec()

    const result = await ResetToken.findByIdAndDelete(resetToken._id)

    console.log(result)

    res.json({ message: 'Password Reset' })
}

// @desc Update user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
    const { id, active, password, name, email, country, region, bio, picture, currentPassword, roles } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'ID is required' })
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Current password is required in the front end if the user tries to change their profile
    // But not in the backend in case an admin tries to ban the user and change active to false
    // Neither is it required when resetting the password through an email link
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

    // New password
    if (password) {

        // Hash password
        user.password = await bcrypt.hash(password, 10) // salt rounds

        const resetToken = await ResetToken.findOne({ user: id }).exec()

        if (resetToken) await ResetToken.findByIdAndDelete(resetToken)
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

    if (roles) {
        user.roles = roles
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

    // For users trying to delete their accounts themselves
    // A current password is required on the front end
    if (currentPassword?.length) {
        const match = await bcrypt.compare(currentPassword, user.password)

        if (!match) {
            return res.status(401).json({ message: 'Incorrect Current Password' })
        }
    }

    // Find all dogs, advertisements and conversations of said user
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

            // Delete all the proposals made for the dog
            const dogProposes = await DogPropose.find({ "dog": dog }).lean().exec()
            if (dogProposes) {
                for (const proposal of dogProposes) {
                    await DogPropose.findByIdAndDelete(proposal)
                }
            }

            const fatherProposes = await FatherPropose.find({ "father": dog }).lean().exec()
            if (fatherProposes) {
                for (const proposal of fatherProposes) {
                    await FatherPropose.findByIdAndDelete(proposal)
                }
            }

            const puppyProposes = await PuppyPropose.find({ "puppy": dog }).lean().exec()
            if (puppyProposes) {
                for (const proposal of puppyProposes) {
                    await PuppyPropose.findByIdAndDelete(proposal)
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
    verifyEmail,
    resetPassword,
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
