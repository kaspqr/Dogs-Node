const Litter = require('../models/Litter')
const Dog = require('../models/Dog')
const FatherPropose = require('../models/FatherPropose')
const PuppyPropose = require('../models/PuppyPropose')

const getLitters = async (req, res) => {
    const {
        bornEarliest,
        bornLatest,
        breed,
        country,
        region,
        lowestPuppies,
        highestPuppies,
        page = 1
    } = req.query

    const query = {}

    if (breed) query.breed = breed
    if (country) query.country = country
    if (region) query.region = region

    if (bornEarliest || bornLatest) {
        const dateConditions = {};
        if (bornEarliest) {
            dateConditions.$gte = new Date(bornEarliest);
        }
        if (bornLatest) {
            dateConditions.$lte = new Date(bornLatest);
        }

        query.$expr = {
            $and: [
                {
                    $gte: [
                        { $dateFromString: { dateString: "$born" } },
                        dateConditions.$gte || new Date("1900-01-01")
                    ]
                },
                {
                    $lte: [
                        { $dateFromString: { dateString: "$born" } },
                        dateConditions.$lte || new Date()
                    ]
                }
            ]
        };
    }

    if (lowestPuppies || highestPuppies) {
        query.children = {};

        if (lowestPuppies) query.children.$gte = parseInt(lowestPuppies);
        if (highestPuppies) query.children.$lte = parseInt(highestPuppies);
    }

    const limit = 20
    const skip = (page - 1) * limit

    const totalLitters = await Litter.countDocuments(query)
    const totalPages = Math.ceil(totalLitters / limit)

    const litters = await Litter.find(query).lean().sort({ _id: -1 }).limit(limit).skip(skip);

    res.json({
        litters,
        totalLitters,
        totalPages
    });
}

const getLitterById = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: 'ID is required' })
    
    const litter = await Litter.findOne({ _id: id })
    if (!litter) return res.status(400).json({ message: 'Litter does not exist' })

    res.json(litter)
}

const getDogLitters = async (req, res) => {
    const { id } = req.params

    if (!id) return res.status(400).json({ message: 'ID is required' })
    
    const dog = await Dog.findOne({ _id: id })
    if (!dog) return res.status(400).json({ message: 'Dog does not exist' })

    const litters = await Litter.find({ $or: [{ mother: dog._id }, { father: dog._id }] })

    res.json(litters)
}

const createNewLitter = async (req, res) => {
    const { mother, born, children, breed, country, region, tokenUserId } = req.body

    if (!mother || !born || !children || !breed || !country) {
        return res.status(400).json({ message: 'Mother, breed, country, date of birth and amount of children is required' })
    }

    const isFemale = await Dog.findById(mother)

    if (!isFemale) return res.status(400).json({ message: `Dog with ID ${mother} does not exist` })
    if (isFemale.user.toString() !== tokenUserId) return res.status(401).json({ message: `Unauthorized` })
    if (isFemale.female !== true) return res.status(400).json({ message: `Dog with ID ${mother} is not female` })

    const litterObject = { mother, born, children, breed, country }

    if (region?.length) litterObject.region = region

    const litter = await Litter.create(litterObject)

    if (litter) {
        res.status(201).json({ message: `Female dog ${mother}'s new litter with ID ${litter?.id} created` })
    } else {
        res.status(400).json({ message: 'Invalid litter data received' })
    }
}

const updateLitter = async (req, res) => {
    const { id, father, removeFather, tokenUserId } = req.body

    if (!id || (!father && !removeFather)) {
        return res.status(400).json({ message: 'Litter ID and either father or remove father required' })
    }

    const litter = await Litter.findById(id).exec()
    if (!litter) return res.status(400).json({ message: 'Litter not found' })

    const motherDog = await Dog.findById(litter.mother)
    if (!motherDog) return res.status(400).json({ message: 'Mother not found' })

    if (motherDog.user.toString() !== tokenUserId) return res.status(401).json({ message: 'Unauthorized' })

    if (father) {
        const dog = await Dog.findById(father).exec()
        if (!dog) return res.status(400).json({ message: `Dog with id ${dog} doesn't exist` })

        if (dog?.female !== false) return res.status(400).json({ message: `Dog with id ${dog} is not male` })

        await FatherPropose.deleteMany({ litter })
        await PuppyPropose.deleteMany({ litter, "puppy": father }).exec()

        litter.father = father
    }

    if (removeFather) litter.father = null

    await litter.save()

    res.json({ message: `Litter with ID ${id} updated` })
}

const deleteLitter = async (req, res) => {
    const { id, tokenUserId, tokenRoles } = req.body

    if (!id) return res.status(400).json({ message: 'Litter ID Required' })

    const litter = await Litter.findById(id).exec()
    if (!litter) return res.status(400).json({ message: 'Litter not found' })

    const motherDog = await Dog.find({ _id: litter.mother })
    if (!motherDog) return res.status(400).json({ message: 'Mother not found' })

    if (motherDog.user.toString() !== tokenUserId &&
        (!tokenRoles.includes("Admin") && !tokenRoles.includes("SuperAdmin"))
    ) return res.status(401).json({ message: 'Unauthorized' })

    await Dog.updateMany(
        { litter },
        { $set: { litter: null } }
    ).exec()

    await FatherPropose.deleteMany({ litter })
    await PuppyPropose.deleteMany({ litter })

    const result = await litter.deleteOne()

    const reply = `Litter with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getLitters,
    getLitterById,
    getDogLitters,
    createNewLitter,
    updateLitter,
    deleteLitter
}
