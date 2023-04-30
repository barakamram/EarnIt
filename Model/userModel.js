const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    children: [{
        name: String,
        // avatar: String,
        totalscore: Number,
    }],
    task: [{
        child: String,
        title: String,
        score: Number,
        completed: Boolean,
        
        // createdAt: { type: Date, default: Date.now, index: {expireAfterSeconds: 10} },
    }],
    prize: [{
        title: String,
        cost: Number,
    }],
}, {timestamps: true});



userSchema.methods.generateJWT = function () {
    const token = jwt.sign({
        _id: this._id,
        username: this.username,
    }, process.env.JWT_SECRET_KEY, {expiresIn: "3d" });
    return token
}

module.exports.User = model('User', userSchema);
