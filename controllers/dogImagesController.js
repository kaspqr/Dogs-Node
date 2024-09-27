const { cloudinary } = require('../utils/cloudinary')
const Dog = require('../models/Dog')

const uploadDogImage = async (req, res) => {
    const { data, dog_id, tokenUserId } = req.body
    try {
        const fileString = data
        const id = dog_id

        const dog = await Dog.findById(id).exec()

        if (!dog) return res.status(400).json({ message: 'Dog does not exist' })

        if (dog.user.toString() !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

        const uploadedResponse = await cloudinary.uploader.upload(fileString, {
            upload_preset: 'berao33q',
            folder: 'dogimages',
            public_id: `dogimages_${id}`,
            overwrite: true
        })

        if (dog) dog.image = uploadedResponse?.secure_url

        await dog.save()

        res.json({ message: "Uploaded" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Something went wrong' })
    }
}

module.exports = {
    uploadDogImage
}
