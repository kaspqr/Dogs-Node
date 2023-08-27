const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Token = require('../models/Token')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password is required' })
    }

    const foundUser = username.includes('@') 
        ? await User.findOne({ email: username }).exec()
        : await User.findOne({ username }).exec()

    if (!foundUser) {
        return res.status(401).json({ message: 'User not found' })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).json({ message: 'Username and password do not match' })

    if (foundUser.verified === false) {
        let token = await Token.findOne({ user: foundUser._id }).exec()
        if (!token) {
            token = await Token.create({ // For email verification
                user: foundUser._id,
                token: crypto.randomBytes(32).toString('hex')
            })

            const url = `${process.env.BASE_URL}users/${foundUser?._id}/verify/${token?.token}`

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
                            <h1>Email Verification</h1>
                        </div>
                        <div class="content">
                            <p>Thank you for signing up! To verify your email address, please click the button below:</p>
                            <a class="button" href="${url}">
                                <b class="button-text">Verify Email</b>
                            </a>
                            <p>This link is valid for 1 hour</p>
                            <p>If the verification button does not work, please go to the link below</p>
                            <p>If you didn't sign up for this, you can safely ignore this email</p>
                        </div>
                    </div>
                </body>
                </html>
                <noscript>
                    Verification Link:
                    ${url}
                </noscript>
            `

            sendEmail(foundUser?.email, 'Verify Email', html)
        }
        return res.status(403).json({ message: 'A verification link has been sent to your email, please click on it.' })
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles,
                "id": foundUser.id
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '100d' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, // Accessible only by web server
        secure: true, // https
        sameSite: 'None', // cross-site cookie
        maxAge: 100 * 24 * 60 * 60 * 1000 // Cookie expiry, to match refreshToken
    })

    // Send accessToken containing username an roles
    res.json({ accessToken })
}


// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(451).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt


    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username })

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles,
                        "id": foundUser.id
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        }
    )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) // No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}
