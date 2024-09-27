const Litter = require('../models/Litter')
const Dog = require('../models/Dog')
const User = require('../models/User')
const PuppyPropose = require('../models/PuppyPropose')
const FatherPropose = require('../models/FatherPropose')
const DogPropose = require('../models/DogPropose')
const { cloudinary } = require('../utils/cloudinary')

const getDogs = async (req, res) => {
    const {
        name,
        breed,
        bornEarliest,
        bornLatest,
        country,
        region,
        passport,
        isFixed,
        female,
        heat,
        chipped,
        chipnumber,
        page = 1
    } = req.query

    let query = {}

    if (name) query.name = { $regex: name, $options: 'i' }
    if (breed) query.breed = breed
    if (country) query.country = country
    if (region) query.region = region
    if (chipnumber) query.chipnumber = chipnumber

    if (passport?.length) {
        if (passport === 'true') query.passport = true
        else query.passport = false
    }

    if (isFixed?.length) {
        if (isFixed === 'true') query.fixed = true
        else query.fixed = false
    }

    if (female?.length) {
        if (female === 'true') query.female = true
        else query.female = false
    }

    if (heat?.length) {
        if (heat === 'true') query.heat = true
        else query.heat = false
    }
    
    if (chipped?.length) {
        if (chipped === 'true') query.chipped = true
        else query.chipped = false
    }

    if (bornEarliest || bornLatest) {
        const dateConditions = {};

        if (bornEarliest) dateConditions.$gte = new Date(bornEarliest);
        if (bornLatest) dateConditions.$lte = new Date(bornLatest);

        query.$expr = {
            $and: [
                {
                    $gte: [
                        { $dateFromString: { dateString: "$birth" } },
                        dateConditions.$gte || new Date("1900-01-01")
                    ]
                },
                {
                    $lte: [
                        { $dateFromString: { dateString: "$birth" } },
                        dateConditions.$lte || new Date()
                    ]
                }
            ]
        };
    }

    const limit = 20
    const skip = (page - 1) * limit

    const totalDogs = await Dog.countDocuments(query)
    const totalPages = Math.ceil(totalDogs / limit)

    const dogs = await Dog.find(query).lean().sort({ _id: -1 }).limit(limit).skip(skip);

    res.json({
        dogs,
        totalPages
    });
}

const getUserDogs = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: 'User ID is required' })

    const foundUser = await User.find({ _id: id }).lean()
    if (!foundUser) return res.status(400).json({ message: 'User not found' })

    const userDogs = await Dog.find({ user: id }).lean()

    res.json(userDogs)
}

const getProposableFatherDogs = async (req, res) => {
    const { userId, litterId } = req.params
    const DAY = 1000 * 60 * 60 * 24

    if (!userId || !litterId) return res.status(400).json({ message: 'User ID and litter ID are required' })

    const litter = await Litter.findOne({ _id: litterId }).lean()
    if (!litter) return res.status(400).json({ message: 'Litter does not exist' })

    const mother = await Dog.findOne({ _id: litter.mother }).lean()
    const userMaleDogs = await Dog.find({ user: userId, female: false }).lean()
    const litterDogs = await Dog.find({ litter: litterId })
    const litterDogIds = litterDogs.map(dog => dog._id.toString());

    const dogsNotPartOfLitter = userMaleDogs.filter(dog => !litterDogIds.includes(dog._id.toString()))

    const dogsOldEnough = dogsNotPartOfLitter.filter(dog =>
        new Date(dog.birth).getTime() < new Date(new Date(litter.born).getTime() - 30 * DAY)
    )

    const dogsNotProposed = (await Promise.all(dogsOldEnough.map(async (dog) => {
        const proposedAsFather = await FatherPropose.findOne({ litter: litterId, father: dog._id });
        const proposedAsPuppy = await PuppyPropose.findOne({ litter: litterId, puppy: dog._id });
    
        return {
            dog,
            isNotProposed: !proposedAsFather && !proposedAsPuppy
        };
    }))).filter(result => result.isNotProposed).map(result => result.dog);

    const proposableDogs = dogsNotProposed.filter(dog => (
        dog.breed !== "Mixed breed" &&
        dog.breed !== mother?.breed &&
        litter?.breed === "Mixed breed"
    ) || (
        dog.breed === "Mixed breed" &&
        litter?.breed === "Mixed breed"
    ) || (
        dog.breed === litter?.breed &&
        litter?.breed === mother?.breed
    ))

    res.json(proposableDogs)
}

const getProposablePuppies = async (req, res) => {
    const { userId, litterId } = req.params
    const DAY = 1000 * 60 * 60 * 24

    if (!userId || !litterId) return res.status(400).json({ message: 'User ID and litter ID are required' })

    const litter = await Litter.findOne({ _id: litterId }).lean()
    if (!litter) return res.status(400).json({ message: 'Litter does not exist' })

    const userDogs = await Dog.find({ user: userId }).lean()
    const litterDogs = await Dog.find({ litter: litterId }).lean()
    const litterDogIds = litterDogs.map(dog => dog._id.toString());

    const dogsNotPartOfLitter = userDogs.filter(dog => !litterDogIds.includes(dog._id.toString()))

    const filteredDogs = (await Promise.all(dogsNotPartOfLitter.map(async (dog) => {
        const matchesFilter = (
            dog.breed === litter.breed && 
            dog._id !== litter.mother &&
            dog._id !== litter.father &&
            dog.litter !== litterId &&
            new Date(dog.birth).getTime() >= new Date(litter?.born).getTime() &&
            new Date(dog.birth).getTime() <= new Date(new Date(litter?.born).getTime() + 7 * DAY).getTime()
        )
    
        const hasNoPuppyProposal = !(await PuppyPropose.findOne({ puppy: dog._id }).lean());
        const hasNoFatherProposal = !(await FatherPropose.findOne({ father: dog._id }).lean());
    
        return { dog, meetsCriteria: matchesFilter && hasNoPuppyProposal && hasNoFatherProposal };
    }))).filter(result => result.meetsCriteria).map(result => result.dog);

    res.json(filteredDogs)
}

const getProposableDogs = async (req, res) => {
    const { userId } = req.params

    if (!userId) return res.status(400).json({ message: 'User ID and receiver ID are required' })

    const userDogs = await Dog.find({ user: userId }).lean()

    const filteredDogs = (await Promise.all(userDogs.map(async (dog) => {    
        const alreadyProposed = !(await DogPropose.findOne({ dog: dog._id }).lean());
    
        return { dog, meetsCriteria: !alreadyProposed };
    }))).filter(result => result.meetsCriteria).map(result => result.dog);

    res.json(filteredDogs)
}

const getLitterPuppies = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: 'Litter ID is required' })

    const dogs = await Dog.find({ litter: id }).lean()

    res.json(dogs)
}

const getDogById = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: 'ID is required' })

    const foundDog = await Dog.findById(id).lean()
    if (!foundDog) return res.status(400).json({ message: 'Dog not found' })

    res.json(foundDog)
}

const createNewDog = async (req, res) => {
    const { tokenUserId, female, country, region, litter, heat,
        sterilized, birth, death, name, breed, info, microchipped, chipnumber, passport } = req.body

    if (!tokenUserId || typeof female !== 'boolean' || !breed || !birth) {
        return res.status(400).json({ message: 'Administrative user, breed and gender is required' })
    }

    const administrativeUser = await User.findById(tokenUserId)
    if (!administrativeUser) return res.status(400).json({ message: 'Administrative user not found' })

    const dogObject = { user: tokenUserId, female, breed, birth }

    if (country?.length) dogObject.country = country
    if (region?.length) dogObject.region = region
    if (litter?.length) dogObject.litter = litter
    if (typeof heat === 'boolean') dogObject.heat = heat
    if (typeof sterilized === 'boolean') dogObject.sterilized = sterilized
    if (death?.length) dogObject.death = death
    if (name?.length) dogObject.name = name
    if (breed?.length) dogObject.breed = breed
    if (info?.length) dogObject.info = info
    if (typeof microchipped === 'boolean') dogObject.microchipped = microchipped
    if (chipnumber?.length) dogObject.chipnumber = chipnumber
    if (typeof passport === 'boolean') dogObject.passport = passport

    dogObject.active = true

    const dog = await Dog.create(dogObject)

    if (dog) {
        res.status(201).json({ message: `New dog with id ${dog?.id} created by user id ${tokenUserId}` })
    } else {
        res.status(400).json({ message: 'Invalid dog data received' })
    }
}

const updateDog = async (req, res) => {
    const { id, name, instagram, facebook, youtube, tiktok, user, country, region, litter, image,
        heat, sterilized, death, info, active, microchipped, chipnumber, passport, tokenUserId, tokenRoles } = req.body

    if (!id) return res.status(400).json({ message: 'ID is required' })

    const dog = await Dog.findById(id).exec()
    if (!dog) return res.status(400).json({ message: 'Dog not found' })

    if (dog.user.toString() !== tokenUserId &&
        (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin"))
    ) return res.status(401).json({ message: 'Unauthorized' })

    if (user?.length) {
        const validUser = await User.findById(user).exec()
        if (!validUser) return res.status(400).json({ message: 'User not found' })

        await DogPropose.deleteMany({ dog: id })
        await FatherPropose.deleteMany({ father: id })
        await PuppyPropose.deleteMany({ puppy: id })

        dog.user = user
    }

    if (name?.length) dog.name = name
    if (instagram?.length) dog.instagram = instagram
    if (facebook?.length) dog.facebook = facebook
    if (youtube?.length) dog.youtube = youtube
    if (tiktok?.length) dog.tiktok = tiktok
    if (typeof active === 'boolean') dog.active = active
    if (country?.length) dog.country = country
    if (region?.length) dog.region = region

    if (litter?.length) {
        if (litter === 'none ') {
            dog.litter = null
        } else {
            await PuppyPropose.deleteMany({ puppy: id })
            await FatherPropose.deleteMany({ father: id, litter })

            dog.litter = litter
        }
    }

    if (typeof heat === 'boolean') dog.heat = heat
    if (typeof sterilized === 'boolean') dog.sterilized = sterilized
    if (death?.length) dog.death = death
    if (info?.length) dog.info = info
    if (typeof microchipped === 'boolean') dog.microchipped = microchipped
    if (chipnumber?.length) dog.chipnumber = chipnumber
    if (typeof passport === 'boolean') dog.passport = passport

    if (image?.length) {
        if (image === 'none ') {
            dog.image = null
            await cloudinary.uploader.destroy(`dogimages/dogimages_${id}`)
        } else {
            try {
                const uploadedResponse = await cloudinary.uploader.upload(image, {
                    upload_preset: 'berao33q',
                    folder: 'dogimages',
                    public_id: `dogimages_${dog?.id}`,
                    overwrite: true
                })

                dog.image = uploadedResponse?.secure_url
            } catch (error) {
                console.log(error)
            }
        }
    }

    await dog.save()

    res.json({ message: `Dog with an ID of ${id} has been updated` })
}

const deleteDog = async (req, res) => {
    const { id, tokenUserId, tokenRoles } = req.body

    if (!id) return res.status(400).json({ message: 'Dog ID Required' })

    const dog = await Dog.findById(id).exec()
    if (!dog) return res.status(400).json({ message: 'Dog not found' })

    if (dog.user.toString() !== tokenUserId &&
        (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin"))
    ) return res.status(401).json({ message: 'Unauthorized' })

    if (dog?.image) await cloudinary.uploader.destroy(`dogimages/dogimages_${id}`)

    const litters = await Litter.find({ "mother": id }).exec()

    if (litters && litters.length > 0) {
        const litterIds = litters.map(litter => litter._id);
    
        await Dog.updateMany(
            { litter: { $in: litterIds } },
            { $set: { litter: null } }
        ).exec()
    
        await Litter.deleteMany({ _id: { $in: litterIds } }).exec();
    }

    await DogPropose.deleteMany({ dog: id })
    await FatherPropose.deleteMany({ father: id })
    await PuppyPropose.deleteMany({ puppy: id })

    const result = await dog.deleteOne()

    const reply = `Dog with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getDogs,
    getUserDogs,
    getProposableFatherDogs,
    getProposablePuppies,
    getProposableDogs,
    getLitterPuppies,
    getDogById,
    createNewDog,
    updateDog,
    deleteDog
}
