require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const { logEvents } = require('./middleware/logger')
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)
app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes/root'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/userreports', require('./routes/userReportRoutes'))
app.use('/dogs', require('./routes/dogRoutes'))
app.use('/dogreports', require('./routes/dogReportRoutes'))
app.use('/dogpictures', require('./routes/dogPictureRoutes'))
app.use('/advertisements', require('./routes/advertisementRoutes'))
app.use('/advertisementreports', require('./routes/advertisementReportRoutes'))
app.use('/advertisementpictures', require('./routes/advertisementPictureRoutes'))
app.use('/litters', require('./routes/litterRoutes'))
app.use('/litterreports', require('./routes/litterReportRoutes'))
app.use('/conversations', require('./routes/conversationRoutes'))
app.use('/messages', require('./routes/messageRoutes'))
app.use('/messagereports', require('./routes/messageReportRoutes'))
app.use('/fatherproposes', require('./routes/fatherProposeRoutes'))
app.use('/puppyproposes', require('./routes/puppyProposeRoutes'))
app.use('/dogproposes', require('./routes/dogProposeRoutes'))
app.use('/dogimages', require('./routes/dogImageRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
