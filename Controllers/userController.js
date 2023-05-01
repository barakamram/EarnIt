const bcrypt = require('bcrypt');
// const _ = require('lodash');
const axios = require('axios');
const otpGenerator = require('otp-generator');
const { User } = require('../Model/userModel');
const { Otp } = require('../Model/otpModel');
// const sendEmail = require('./../Utils/sendEmail')


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.Signup = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (existUser.length) 
            return res.json({
                status: 'FAILED',
                message: 'Username Already Exists',
            })
        const existEmail = await User.find({ email: req.body.email });
        if (existEmail.length) 
            return res.json({
                status: 'FAILED',
                message: 'Email Already Registered',
            })

        const OTP = otpGenerator.generate(4, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        console.log(OTP)
        // const mailOptions = {
        //     from: process.env.AUTH_EMAIL,
        //     to: req.body.email,
        //     subject: "Verify Your Email",
        //     html: `<p>Enter <b>${OTP}</b> in the app to verify your email adddress and complete the signup and login into your account.</p> <p>This code <b>expires in X hour</b>.</p>`,
        // };
        const otp = new Otp({ username: req.body.username, email: req.body.email, password: req.body.password, otp: OTP });
        const salt = await bcrypt.genSalt(10);
        otp.password = await bcrypt.hash(otp.password, salt);
        otp.otp = await bcrypt.hash(otp.otp, salt); 
        const result = await otp.save();
        // await sendEmail(mailOptions);

        return res.json({
            status: 'PENDING',
            message: 'Otp Sent Successfully',
            data: result
        })
    } catch (error) {
        throw (error)
    }
}
module.exports.VerifyOtp = async (req, res) => {
    try {
        const otpHolder = await Otp.find({ email: req.body.email });
        if (otpHolder.length === 0) 
            return res.json({
                status: 'FAILED',
                message: 'You use an Expired OTP or your email doesnt regirested',
            })
            
        const otpFind = otpHolder[otpHolder.length -1];
        const validUser = await bcrypt.compare(req.body.otp, otpFind.otp);
        if (otpFind.email === req.body.email && validUser) {
            const user = new User({username: otpFind.username, email: req.body.email, password: otpFind.password });
            const token = user.generateJWT();
            const result = await user.save();
            const OTPDelete = await Otp.deleteMany({ email: otpFind.email });
            return res.json({
                status: 'SUCCESS',
                message: 'User Registeration Successfully',
                token: token,
                data: result
            })

        } else {
            return res.json({
                status: 'FAILED',
                message: 'Your OTP was wrong',
            })
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.Signin = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        const existEmail = await User.find({ email: req.body.username });
        if (!existUser.length  && !existEmail.length) {
            return res.json({
                status: 'FAILED',
                message: 'Username and Email are not exists',
            })
        } else {
            let user 
            if (existUser.length) user = existUser;
            else user = existEmail;
           const passwordMatch = await bcrypt.compare(req.body.password, user[0].password);
            if(!passwordMatch) {
                return res.json({
                    status: 'FAILED',
                    message: 'password incorrect',
                })
            } else {
                return res.json({
                    status: 'SUCCESS',
                    message: 'User Login Successfully',
                    data: user 
                })
            }
        }
    } catch (error) {
        throw (error)
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.AddChild = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) 
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        for (let num = 0; num < existUser[0].children.length; num++) {
            child = existUser[0].children[num].name
            if (child == req.body.name) 
                return res.json({
                    status: 'FAILED',
                    message: 'Thie name already exists',
                })
        }  
        const newChild = await User.updateOne(
            {username: req.body.username},
            {$push: {children: [{
                name: req.body.name,
                // avatar: req.body.avatar,
                totalscore: req.body.totalscore? req.body.totalscore: 0,
            }], }
        })
        return res.json({
            status: 'SUCCESS',
            message: 'Child added Successfully',
        })
    } catch (error) {
        throw (error)
    }
}
module.exports.DeleteChild = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            const deleteChild = await User.updateOne(
                {username: req.body.username},
                {'$pull': {'children': { 'name': req.body.name }}
            })
            return res.json({
                status: 'SUCCESS',
                message: 'Child removed Successfully',
            })
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.GetChild = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            return res.json({
                status: 'SUCCESS',
                data: existUser[0].children 
            })
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.EditChild = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length )  {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            const editChild = await User.updateOne({ 
                username: req.body.username,
                children: {$elemMatch: { name: req.body.name }}
            }, {"$set" : { 
                "children.$.name" : req.body.newName ? req.body.newName : req.body.name, 
                // "task.$.avatar" : req.body.newAvatar ? req.body.newAvatar : req.body.avatar, 
                "children.$.totalscore" : req.body.totalscore
            }}); 
            // const editTasks =  await User.updateMany({
            //     username: req.body.username,
            //     task:  {$elemMatch: { child: req.body.name }}
            // }, { $set: { "task.$.child" : req.body.newName ? req.body.newName : req.body.name, 
            // }}); 
             
        }
        

                return res.json({
                    status: 'SUCCESS',
                    message: 'Child updated Successfully',
                    // data: tasks[0].task
                })    
    } catch (error) {
        throw (error)
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.AddTask = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) 
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        
        const newTask = await User.updateOne(
            {username: req.body.username},
            {$push: {task: [{
                child: req.body.child,
                title: req.body.title,
                score: req.body.score,
                completed: false,
                // createdAt: Date.now(),
                // expiresAt: Date.now() + req.body.expire,
            }], }
        })
        return res.json({
            status: 'SUCCESS',
            message: 'Task added Successfully',
        })
    } catch (error) {
        throw (error)
    }
}
module.exports.DeleteTask = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            const deleteTask = await User.updateOne(
                {username: req.body.username},
                {'$pull': {'task': { 'child': req.body.child, 'title': req.body.title }}
            })
            return res.json({
                status: 'SUCCESS',
                message: 'task deleted Successfully',
            })
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.GetTask = async (req, res) => {
    try {
        const existUser = await User.findOne({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            return res.json({
                status: 'SUCCESS',
                data: existUser[0].task 
            })
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.GetChildTask = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            const list = existUser[0].task
            let childlist = []
            for (let i = 0; i < list.length; i++) {
                if (list[i].child == req.body.child)
                    childlist.push({
                        child: list[i].child,
                        title: list[i].title,
                        score: list[i].score,
                        completed: list[i].completed,
                    })
            }
            return res.json({
                status: 'SUCCESS',
                data: childlist
            })
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.EditTask = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })}

        const editTask = await User.updateOne({ 
            username: req.body.username,
            task: {$elemMatch: { child: req.body.child, title: req.body.title }}
        }, {"$set" : { 
            "task.$.child" : req.body.newChild ? req.body.newChild : req.body.child, 
            "task.$.title" : req.body.newTitle ? req.body.newTitle : req.body.title, 
            "task.$.score" : req.body.score 
        }});    
        
        return res.json({
            status: 'SUCCESS',
            message: 'Task updated Successfully',
            // data: editTask[0]
        })
    } catch (error) {
        throw (error)
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.TaskCompleted = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            const editTask = await User.updateOne({ 
                username: req.body.username,
                task: {$elemMatch: { child: req.body.child, title: req.body.title }}
            }, {"$set" : {  "task.$.completed" : true }});    
            return res.json({
                status: 'PENDING',
                message: 'Task waitng for confirm',
            })        
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.GetCompletedTask = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            const list = existUser[0].task
            let completedlist = []
            for (let i = 0; i < list.length; i++) {
                if (list[i].completed)
                completedlist.push({
                        child: list[i].child,
                        title: list[i].title,
                        score: list[i].score
                    })
            }
            return res.json({
                status: 'SUCCESS',
                data: completedlist
            })
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.ConfirmCompletedTask = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            const childlist =existUser[0].children
            const tasklist = existUser[0].task
            let childscore = 0
            for (let j = 0; j < childlist.length; j++) {
                if (childlist[j].name == req.body.child) {
                    childscore = childlist[j].totalscore
                    break
                }
            } 
            for (let i = 0; i < tasklist.length; i++) {
                if (tasklist[i].child == req.body.child && tasklist[i].title == req.body.title) {
                    const deleteTask = await User.updateOne(
                        {username: req.body.username},
                        {'$pull': {'task': { 'child': req.body.child, 'title': req.body.title }}
                    })
                    const editChild = await User.updateOne({ 
                        username: req.body.username,
                        children: {$elemMatch: { name: req.body.child }}
                    }, {"$set" : { 
                        "children.$.totalscore" : tasklist[i].score + childscore
                    }}); 
                    return res.json({
                        status: 'SUCCESS',
                        message: 'Task completed Successfully',
                        data: editChild[0]
                    })
                }  
            }
            
        }
        
    } catch (error) {
        throw (error)
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.AddPrize = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) 
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        
        const newPrize = await User.updateOne(
            {username: req.body.username},
            {$push: {prize: [{
                title: req.body.title,
                cost: req.body.cost,
            }], }
        })
        return res.json({
            status: 'SUCCESS',
            message: 'Prize added Successfully',
        })
    } catch (error) {
        throw (error)
    }
}
module.exports.DeletePrize = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            const deletePrize = await User.updateOne(
                {username: req.body.username},
                {'$pull': {'prize': { 'title': req.body.title }}
            })
            return res.json({
                status: 'SUCCESS',
                message: 'Prize deleted Successfully',
            })
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.GetPrize = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })
        } else {
            return res.json({
                status: 'SUCCESS',
                data: existUser[0].prize 
            })
        }
    } catch (error) {
        throw (error)
    }
}
module.exports.EditPrize = async (req, res) => {
    try {
        const existUser = await User.find({ username: req.body.username });
        if (!existUser.length ) {
            return res.json({
                status: 'FAILED',
                message: 'Username are not exists',
            })}
        const editPrize = await User.updateOne({ 
            username: req.body.username,
            prize: {$elemMatch: { title: req.body.title }}
        }, {"$set" : { 
            "prize.$.title" : req.body.newTitle ? req.body.newTitle : req.body.title, 
            "prize.$.cost" : req.body.cost   
        }});    
        
        return res.json({
            status: 'SUCCESS',
            message: 'Prize updated Successfully',
            // data: editPrize[0]
        })
    } catch (error) {
        throw (error)
    }
}








