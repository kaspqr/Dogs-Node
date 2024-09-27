const { cloudinary } = require('../utils/cloudinary')
const Advertisement = require('../models/Advertisement')

const uploadAdvertisementImage = async (req, res) => {
    const { data, advertisement_id, tokenUserId } = req.body

    try {
        const fileString = data
        const id = advertisement_id

        const advertisement = await Advertisement.findById(id).exec()

        if (!advertisement) return res.status(400).json({ message: 'Advertisement does not exist' })
        
        if (advertisement.poster.toString() !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

        const uploadedResponse = await cloudinary.uploader.upload(fileString, {
            upload_preset: 'berao33q',
            folder: 'advertisementimages',
            public_id: `advertisementimages_${id}`,
            overwrite: true
        })

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
