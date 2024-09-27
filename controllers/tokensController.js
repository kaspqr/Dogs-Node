const Token = require('../models/Token')

const getUserToken = async (req, res) => {
    const { token, user } = req.params

    if (!token || !user) return res.status(400).send({ message: "Token and user ID are required" })

    const userToken = await Token.findOne({ token, user }).lean()
    if (!userToken) return res.status(400).send({ message: "Token not found" })

    res.json(userToken)
}

module.exports = {
    getUserToken
}
