const { cloudinary } = require('../utils/cloudinary')
const User = require('../models/User')

const uploadUserImage = async (req, res) => {
    const { data, user_id, tokenUserId } = req.body

    if (user_id !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    try {
        const fileString = data
        const id = user_id

        const user = await User.findById(id).exec()

        if (!user) return res.status(400).json({ message: 'User does not exist' })
        
        const uploadedResponse = await cloudinary.uploader.upload(fileString, {
            upload_preset: 'berao33q',
            folder: 'userimages',
            public_id: `userimages_${id}`,
            overwrite: true
        })

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
