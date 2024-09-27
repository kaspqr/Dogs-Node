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

/* const Token = require('../models/Token')
const ResetToken = require('../models/ResetToken')
const EmailToken = require('../models/EmailToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto') */
const { cloudinary } = require('../utils/cloudinary')

/* const verifyEmail = async (req, res) => {
    try {
        const userId = req.params.id
        const tokenId = req.params.token

        const user = await User.findById(userId)
        if (!user) return res.status(400).send({ message: "Invalid Link" })

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
} */

/* const verifyNewEmail = async (req, res) => {
    try {
        const userId = req.params.id
        const tokenId = req.params.emailtoken

        const user = await User.findById(userId)
        if (!user) return res.status(400).send({ message: "Invalid Link" })

        const token = await EmailToken.findOne({
            user: userId,
            emailToken: tokenId
        })

        if (!token) return res.status(400).send({ message: "Invalid Link" })

        user.email = token?.email

        await user.save()

        await token.deleteOne()

        res.status(200).send({ message: 'Email Verified Successfully' })

    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' })
        console.log(error)
    }
} */

const getUserById = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: `ID required` })

    const user = await User.findOne({ _id: id }).select('-password').exec()

    if (!user) return res.status(400).json({ message: `User with id ${id} not found` })

    res.json(user)
}

const getUsers = async (req, res) => {
    const {
        username = '',
        country = '',
        region = '',
        page = 1,
    } = req.query

    const query = {}

    if (username) query.username = { $regex: username, $options: 'i' };
    if (country) query.country = country;
    if (region && country) query.region = region;

    const limit = 20
    const skip = (page - 1) * limit

    const totalUsers = await User.countDocuments(query)
    const totalPages = Math.ceil(totalUsers / limit)

    const users = await User.find(query).select('-password').lean().sort({ _id: -1 }).limit(limit).skip(skip);

    res.json({
        users,
        totalUsers,
        totalPages
    });
}

const createNewUser = async (req, res) => {
    const { username, password, name, email, country, region, bio } = req.body

    if (!username?.length || !password?.length || !name?.length || !email?.length || !country?.length) {
        return res.status(400).json({ message: 'All fields except region and bio are required' })
    }

    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if (duplicate) return res.status(409).json({ message: 'Duplicate username' })

    const emailDuplicate = await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if (emailDuplicate) return res.status(409).json({ message: 'Duplicate email' })

    const roles = ["User"]
    const hashedPassword = await bcrypt.hash(password, 10)

    const userObject = { username, "password": hashedPassword, name, email, country, roles }

    if (region?.length) userObject.region = region
    if (bio?.length) userObject.bio = bio

    const user = await User.create(userObject)

    if (user) {
        /* const token = await Token.create({ // For email verification
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
                        <p>This link is valid for 1 hour</p>
                        <p>If the verification button does not work, please go to the link below</p>
                        <p>If you didn't sign up for this, you can safely ignore this email</p>
                    </div>
                </div>
            </body>
            </html>
            <noscript>
                Verification Link:
                ${url}
            </noscript>
        `

        sendEmail(user?.email, 'Verify Email', html) */

        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
}

/* const resetPassword = async (req, res) => {
    const { id, password } = req.body

    if (!id || !password) res.status(400).json({ message: 'ID and password is required' })

    const user = await User.findById(id).exec()

    if (!user) return res.status(400).json({ message: 'User not found' })

    user.password = await bcrypt.hash(password, 10) // salt rounds

    await user.save()

    // const resetToken = await ResetToken.findOne({ user: id }).lean().exec()
    // const result = await ResetToken.findByIdAndDelete(resetToken._id)

    res.json({ message: 'Password Reset' })
} */

const updateUser = async (req, res) => {
    const { tokenUserId, password, name, email, country, region, bio, picture, currentPassword, roles, image } = req.body

    if (!tokenUserId || !currentPassword) return res.status(400).json({ message: 'ID and current password is required' })

    const user = await User.findById(tokenUserId).exec()
    if (!user) return res.status(400).json({ message: 'User not found' })

    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) return res.status(401).json({ message: 'Incorrect Current Password' })

    if (password) {
        user.password = await bcrypt.hash(password, 10) // salt rounds

        /* const resetToken = await ResetToken.findOne({ user: id }).exec()
        if (resetToken) await ResetToken.findByIdAndDelete(resetToken) */
    }

    if (bio?.length) user.bio = bio

    if (email?.length) {
        const emailDuplicate = await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()

        if (emailDuplicate && emailDuplicate?._id?.toString() !== tokenUserId) {
            return res.status(409).json({ message: 'Duplicate email' })
        }

        user.email = email

        /* const token = await EmailToken.create({ // For email verification
            user: user._id,
            email: email,
            emailToken: crypto.randomBytes(32).toString('hex')
        })

        const url = `${process.env.BASE_URL}users/${user?._id}/verifyemail/${token?.emailToken}`

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
                        <p>In order to verify your new email address, please click the button below:</p>
                        <a class="button" href="${url}">
                            <b class="button-text">Verify Email</b>
                        </a>
                        <p>This link is valid for 1 hour</p>
                        <p>If the verification button does not work, please go to the link below</p>
                        <p>If you didn't request for your email to be changed, please change your password immediately</p>
                    </div>
                </div>
            </body>
            </html>
            <noscript>
                Verification Link:
                ${url}
            </noscript>
        `

        sendEmail(email, 'Verify Email', html) */
    }

    if (name?.length) user.name = name
    if (country?.length) user.country = country
    if (region?.length) user.region = region
    if (picture) user.picture = picture
    if (roles) user.roles = roles

    if (image?.length) {
        if (image === 'none ') {
            user.image = null
            await cloudinary.uploader.destroy(`userimages/userimages_${id}`)
        } else {
            try {
                const uploadedResponse = await cloudinary.uploader.upload(image, {
                    upload_preset: 'berao33q',
                    folder: 'userimages',
                    public_id: `userimages_${tokenUserId}`,
                    overwrite: true
                })

                user.image = uploadedResponse?.secure_url
            } catch (error) {
                console.log(error)
            }
        }
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
}

const deleteUser = async (req, res) => {
    const { id, currentPassword, tokenUserId, tokenRoles } = req.body

    if (!id || !currentPassword) {
        return res.status(400).json({ message: 'User ID and current password Required' })
    }

    if (id !== tokenUserId &&
        (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin"))
    ) return res.status(401).json({ message: 'Unauthorized' })

    const user = await User.findById(id).exec()
    if (!user) return res.status(400).json({ message: 'User not found' })

    const match = await bcrypt.compare(currentPassword, user.password)
    if (!match) return res.status(401).json({ message: 'Incorrect Current Password' })

    if (user?.image) await cloudinary.uploader.destroy(`userimages/userimages_${id}`)

    const dogs = await Dog.find({ "user": id }).lean().exec()

    if (dogs?.length) {
        const dogIds = dogs.map(dog => dog._id);

        const femaleDogIds = dogs.filter(dog => dog.female).map(dog => dog._id);
        const maleDogIds = dogs.filter(dog => !dog.female).map(dog => dog._id);

        if (femaleDogIds.length > 0) {
            const femaleLitters = await Litter.find({ mother: { $in: femaleDogIds } }).lean().exec();
            const litterIds = femaleLitters.map(litter => litter._id);

            await Dog.updateMany({ litter: { $in: litterIds } }, { $unset: { litter: "" } }).exec();
            await Litter.deleteMany({ _id: { $in: litterIds } });
        }

        if (maleDogIds.length > 0) {
            await Litter.updateMany({ father: { $in: maleDogIds } }, { $unset: { father: "" } }).exec();
        }

        await DogPropose.deleteMany({ dog: { $in: dogIds } });
        await FatherPropose.deleteMany({ father: { $in: dogIds } });
        await PuppyPropose.deleteMany({ puppy: { $in: dogIds } });

        const dogImages = dogs.filter(dog => dog.image).map(dog => `dogimages/dogimages_${dog._id}`);
        if (dogImages.length > 0) {
            await Promise.all(dogImages.map(image => cloudinary.uploader.destroy(image)));
        }

        await Dog.deleteMany({ user: user._id })
    }

    await Advertisement.deleteMany({ poster: id });
    await Conversation.deleteMany({ $or: [{ receiver: id }, { sender: id }] });
    await Message.deleteMany({ sender: id })

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getUserById,
    getUsers,
    createNewUser,
    updateUser,
    deleteUser
}
