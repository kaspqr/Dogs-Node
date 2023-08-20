const { cloudinary } = require('../utils/cloudinary')
const Dog = require('../models/Dog')

const uploadDogImage = async (req, res) => {
    try {
        const fileString = req.body.data
        const id = req.body.dog_id

        const dog = await Dog.findById(id).exec()

        const uploadedResponse = await cloudinary.uploader.upload(fileString, {
            upload_preset: 'berao33q',
            public_id: `dogimages_${id}`,
            overwrite: true
        })
        console.log(uploadedResponse.secure_url)

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
