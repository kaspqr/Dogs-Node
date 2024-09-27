const EmailToken = require('../models/EmailToken')

const getEmailToken = async (req, res) => {
    const { emailToken, user } = req.params

    if (!emailToken || !user) return res.status(400).json({ message: 'Email token and user ID are required' })

    const userEmailToken = await EmailToken.findOne({ emailToken, user }).lean()
    if (!userEmailToken) return res.status(400).json({ message: 'Email token not found' })
        
    res.json(userEmailToken)
}

module.exports = {
    getEmailToken
}
