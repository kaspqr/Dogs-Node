const User = require('../models/User')
const Advertisement = require('../models/Advertisement')
const { cloudinary } = require('../utils/cloudinary')

const getAdvertisements = async (req, res) => {
    const {
        title = '',
        type = '',
        breed = '',
        country = '',
        region = '',
        currency = '',
        lowestPrice,
        highestPrice,
        priceSort = '',
        page = 1
    } = req.query;

    const filters = {};

    if (title) filters.title = { $regex: title, $options: 'i' };

    if (type) filters.type = type;
    if (breed) filters.breed = breed;
    if (country) filters.country = country;
    if (country && region) filters.region = region;
    if (currency) filters.currency = currency;

    if (lowestPrice || highestPrice) {
        filters.price = {};
        if (lowestPrice) filters.price.$gte = parseInt(lowestPrice);
        if (highestPrice) filters.price.$lte = parseInt(highestPrice);
    }

    let sortOption = { _id: -1 };

    if (priceSort === 'ascending') sortOption.price = 1;
    else if (priceSort === 'descending') sortOption.price = -1;

    const limit = 20;
    const skip = (page - 1) * limit;

    try {
        const totalAds = await Advertisement.countDocuments(filters);

        const advertisements = await Advertisement.find(filters)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        const totalPages = Math.ceil(totalAds / limit);

        res.json({
            advertisements,
            totalAds,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserAdvertisements = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: 'ID is required' })

    const advertisements = await Advertisement.find({ poster: id }).lean()

    res.json(advertisements)
}

const getAdvertisementById = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: 'ID is required' })

    const advertisement = await Advertisement.findById(id).lean()
    if (!advertisement) return res.status(400).json({ message: 'Advertisement does not exist' })

    res.json(advertisement)
}

const createNewAdvertisement = async (req, res) => {
    const { premium, tokenUserId, title, type, price, info, currency, country, region, image, breed } = req.body

    if (!tokenUserId || !title || !type || !country) {
        return res.status(400).json({ message: 'Premium, poster, title, type, country and price is required' })
    }

    const validPoster = await User.findById(tokenUserId).select('-password').exec()
    if (!validPoster) return res.status(400).json({ message: `Poster with ID ${tokenUserId} not found` })

    if (validPoster?.active !== true) {
        return res.status(400).json({ message: `Poster with ID ${tokenUserId} is banned` })
    }

    const advertisementObject = { poster: tokenUserId, title, type, country }

    if (typeof info === 'string' && info?.length) advertisementObject.info = info
    if (typeof premium === 'boolean') advertisementObject.premium = premium
    if (price?.length) advertisementObject.price = price
    if (currency?.length) advertisementObject.currency = currency
    if (region?.length) advertisementObject.region = region
    if (breed?.length) advertisementObject.breed = breed

    const advertisement = await Advertisement.create(advertisementObject)

    if (advertisement) {
        if (image?.length) {
            try {
                const uploadedResponse = await cloudinary.uploader.upload(image, {
                    upload_preset: 'berao33q',
                    folder: 'advertisementimages',
                    public_id: `advertisementimages_${advertisement?.id}`,
                    overwrite: true
                })
        
                advertisement.image = uploadedResponse?.secure_url
        
                await advertisement.save()
            } catch (error) {
                console.log(error)
            }
        }

        res.status(201).json({ message: `New advertisement ${title} with ID ${advertisement?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid advertisement data received' })
    }
}

const updateAdvertisement = async (req, res) => {
    const { id, premium, title, type, price, info, active, currency, country, region, image, tokenUserId, tokenRoles } = req.body

    if (!id) return res.status(400).json({ message: 'Advertisement ID required' })

    const advertisement = await Advertisement.findById(id).exec()
    if (!advertisement) return res.status(400).json({ message: 'Advertisement not found' })

    if (advertisement.poster.toString() !== tokenUserId &&
        (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin"))
    ) return res.status(401).json({ message: 'Unauthorized' })

    if (typeof premium === 'boolean') advertisement.premium = premium
    if (title) advertisement.title = title
    if (country) advertisement.country = country
    if (region?.length) advertisement.region = region
    else advertisement.region = ''
    if (price) advertisement.price = price
    if (currency) advertisement.currency = currency
    if (info) advertisement.info = info
    if (type) advertisement.type = type
    if (typeof active === 'boolean') advertisement.active = active

    if (image?.length) {
        if (image === 'none ') {
            advertisement.image = null
            await cloudinary.uploader.destroy(`advertisementimages/advertisementimages_${id}`)
        } else {
            try {
                const uploadedResponse = await cloudinary.uploader.upload(image, {
                    upload_preset: 'berao33q',
                    folder: 'advertisementimages',
                    public_id: `advertisementimages_${advertisement?.id}`,
                    overwrite: true
                })
        
                advertisement.image = uploadedResponse?.secure_url
            } catch (error) {
                console.log(error)
            }
        }
    }

    const updatedAdvertisement = await advertisement.save()

    res.json({ message: `Advertisement ${updatedAdvertisement?.title} with ID ${id} updated` })
}

const deleteAdvertisement = async (req, res) => {
    const { id, tokenUserId, tokenRoles } = req.body

    if (!id) return res.status(400).json({ message: 'Advertisement ID Required' })

    const advertisement = await Advertisement.findById(id).exec()
    if (!advertisement) return res.status(400).json({ message: 'Advertisement not found' })

    if (advertisement.poster.toString() !== tokenUserId &&
        (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin"))
    ) return res.status(401).json({ message: 'Unauthorized' })

    if (advertisement?.image) {
        await cloudinary.uploader.destroy(`advertisementimages/advertisementimages_${id}`)
    }

    const result = await advertisement.deleteOne()

    const reply = `Advertisement ${result.title} with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAdvertisements,
    getUserAdvertisements,
    getAdvertisementById,
    createNewAdvertisement,
    updateAdvertisement,
    deleteAdvertisement
}
