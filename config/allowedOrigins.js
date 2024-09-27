const allowedOrigins = process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000']
    : [
        'exp://exp.host/@kaspqr/pawretriever?release-channel=default',
        'https://pawretriever.onrender.com',
        'https://www.pawretriever.com',
        'https://pawretriever.com',
    ]

module.exports = allowedOrigins
