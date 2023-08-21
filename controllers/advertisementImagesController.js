const { cloudinary } = require('../utils/cloudinary')
const Advertisement = require('../models/Advertisement')

const uploadAdvertisementImage = async (req, res) => {
    try {
        const fileString = req.body.data
        const id = req.body.advertisement_id

        const advertisement = await Advertisement.findById(id).exec()

        const uploadedResponse = await cloudinary.uploader.upload(fileString, {
            upload_preset: 'berao33q',
            folder: 'advertisementimages',
            public_id: `advertisementimages_${id}`,
            overwrite: true
        })
        console.log(uploadedResponse.secure_url)

        if (advertisement) advertisement.image = uploadedResponse?.secure_url

        await advertisement.save()

        res.json({ message: "Uploaded" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Something went wrong' })
    }
}

module.exports = {
    uploadAdvertisementImage
}
