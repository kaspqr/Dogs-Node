const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: Array,
        default: ["User"],
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    picture: {
        type: String
    },
    bio: {
        type: String
    },
    country: {
        type: String,
        required: true
    },
    region: {
        type: String,
    }
})

module.exports = mongoose.model('User', userSchema)
