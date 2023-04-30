const { Schema, model } = require('mongoose');
// const jwt = require('jsonwebtoken');


module.exports.Otp = model('Otp', Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now, index: {expires: 300} }
}, {timestamps: true }));


