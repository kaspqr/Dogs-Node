const ResetToken = require('../models/ResetToken')
const User = require('../models/User')

const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

const getResetToken = async (req, res) => {
    const { resetToken, user } = req.params

    if (!resetToken || !user) return res.status(400).send({ message: "resetToken and user ID are required" })

    const userResetToken = await ResetToken.findOne({ resetToken, user }).lean()
    if (!userResetToken) return res.status(400).json({ message: 'Reset token not found' })
        
    res.json(userResetToken)
}

const createNewResetToken = async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email: email }).exec()
    if (!user) return res.status(400).send({ message: "User with specified email does not exist" })

    const invalidRequest = await ResetToken.findOne({ user: user?._id }).exec()
    if (invalidRequest) res.status(400).send({ message: "A request has already been sent to the email" })

    const resetToken = await ResetToken.create({
        user: user._id,
        resetToken: crypto.randomBytes(32).toString('hex')
    })

    const url = `${process.env.BASE_URL}resetpassword/${user?._id}/verify/${resetToken?.resetToken}`

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #007bff;
                    color: white;
                    text-align: center;
                    padding: 10px;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                }
                .content {
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .button-text {
                    color: white;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reset Password</h1>
                </div>
                <div class="content">
                    <p>If you requested to reset your Paw Retriever account password, please click on the button below:</p>
                    <a class="button" href="${url}">
                        <b class="button-text">Reset Password</b>
                    </a>
                    <p>This link is valid for 1 hour</p>
                    <p>If the reset button does not work, please go to the link below</p>
                    <p>If you didn't request for your password to be reset, you can safely ignore this email</p>
                </div>
            </div>
        </body>
        </html>
        <noscript>
            Reset Password Link:
            ${url}
        </noscript>
    `

    sendEmail(email, 'Reset Password', html)

    res.status(201).json({ message: `Password Reset Link Sent` })
}

module.exports = {
    getResetToken,
    createNewResetToken
}
