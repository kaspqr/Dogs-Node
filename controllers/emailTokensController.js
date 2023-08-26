const EmailToken = require('../models/EmailToken')

// @desc Get all email tokens
// @route GET /emailtokens
// @access Private
const getAllEmailTokens = async (req, res) => {
    const emailTokens = await EmailToken.find().lean()
    res.json(emailTokens)
}

module.exports = {
    getAllEmailTokens
}
