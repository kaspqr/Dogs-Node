const Token = require('../models/Token')

// @desc Get all advertisement reports
// @route GET /tokens
// @access Private
const getAllTokens = async (req, res) => {
    const tokens = await Token.find().lean()
    res.json(tokens)
}

module.exports = {
    getAllTokens
}
