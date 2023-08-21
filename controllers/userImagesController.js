const { cloudinary } = require('../utils/cloudinary')
const User = require('../models/User')

const uploadUserImage = async (req, res) => {
    try {
        const fileString = req.body.data
        const id = req.body.user_id

        const user = await User.findById(id).exec()

        const uploadedResponse = await cloudinary.uploader.upload(fileString, {
            upload_preset: 'berao33q',
            folder: 'userimages',
            public_id: `userimages_${id}`,
            overwrite: true
        })
        console.log(uploadedResponse.secure_url)

        if (user) user.image = uploadedResponse?.secure_url

        await user.save()

        res.json({ message: "Uploaded" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Something went wrong' })
    }
}

module.exports = {
    uploadUserImage
}
