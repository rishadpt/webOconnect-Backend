const db = require('../models/index');
const User = db.users;
const validation = require('../helpers/validation_schema')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let refreshTokens = []
//Create new user

const userLogin = async (req, res) => {   //user login function email and password required
    try {
        const { email, password } = req.body;
        const result = await validation.loginValidation.validateAsync(req.body);;
        const user = await User.findOne({ where: { email } });

        if (user) {
            const isPasswordMatched = await bcrypt.compare(password, user.password);
            if (!isPasswordMatched) {
                return res.status(401).send({
                    message: 'Invalid password',
                    status: "failed"
                })
            }
            //signing the token with jwt
            const token = jwt.sign({ id: user.id, user: user.name }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
            const refreshtoken = jwt.sign({ id: user.id, user: user.name }, process.env.JWT_REFRESH_KEY, { expiresIn: '7d' })
            refreshTokens.push(refreshtoken)
            return res.status(200).send({ status: "OK", message: "Login Successful", token: token, refresh: refreshtoken });
        } else {
            return res.status(404).send({
                message: 'Login Failed',
                status: "failed"
            })
        }
    }

    catch (err) {
        if (err.isjoi) {
            return res.status(400).send({
                message: err.details[0].message,
                status: "failed"
            })
        } else {
            return res.status(500).send({
                message: err.toString(),
                status: "failed"
            })
        }
    }
}

const createUser = async (req, res) => {

    try {
        const { name, email, password, phone, gender } = req.body;  //destructuring the req.body
        const result = await validation.userScheme.validateAsync(req.body); //validating the req.body
        const userdata = {                         // creating new user object
            name,
            email,
            password,  //Using the encrypted password
            phone,
            gender
        }
        if (password) {
            userdata.password = await bcrypt.hash(userdata.password, 10);  // encrypting password
        }

        await User.create(userdata);      // creating new user

        return res.status(200).send({
            message: 'User created successfully',
            status: "OK"
        })

    } catch (err) {
        return res.status(500).send({
            message: err.toString(),
            status: "failed"
        })
    }
}

//Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        return res.status(200).send(users);
    } catch (err) {
        return res.status(500).send({
            message: err.message
        })
    }
}

const getUserbyID = async (req, res) => {           //Get user by id

    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { id }, attributes: { exclude: ['password'] } });
        if (user) {
            return res.status(200).send(user);
        } else {
            return res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }
    } catch (err) {
        return res.status(500).send({
            message: err.message
        })
    }
}


const deleteUser = async (req, res) => {        //Delete user id required
    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { id } });
        if (user) {
            await User.destroy({ where: { id } });
            return res.status(200).send({
                message: 'User deleted successfully',
                status: 'OK'
            })
        } else {
            return res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }
    } catch (err) {
        return res.status(500).send({
            message: "User not found",
            status: 'failed'
        })
    }
}

const editUser = async (req, res) => {      //editUser function name, email
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;
        const result = await validation.editValidation.validateAsync(req.body)
        const user = await User.findOne({ where: { id } });
        const isExistname = await User.findAll({ where: { name } });
        const isExistemail = await User.findAll({ where: { email } });
        const isExistphone = await User.findAll({ where: { phone } });
        if (user) {
         
            if (isExistname.length >1) {
                return res.status(400).send({
                    message: 'Name already exists',
                    status: 'failed',
                    isExistname,
                    isExistemail,
                    isExistphone
                })
            }
            else if (isExistname.length >1) {
                return res.status(400).send({
                    message: 'Email already exists',
                    status: 'failed'
                })
            }
            else if (isExistname.length >1) {
                return res.status(400).send({
                    message: 'Phone already exists',
                    status: 'failed'
                })
            } else {
                await User.update({ name, email, phone }, { where: { id } });
                return res.status(200).send({
                    message: 'Profilers updated successfully',
                    status: 'OK'
                })
            }

        } else {
            return res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }

    } catch (err) {
        return res.status(500).send({
            message: "Failed to update user",
            status: 'failed'
        })
    }
}

const changePassword = async (req, res) => {            //changePassword function old password and new password required
    try {
        const { id } = req.params;
        const { password, oldPassword } = req.body;
        const result = await validation.changePassword.validateAsync(req.body)
        const user = await User.findOne({ where: { id } });
        if (user) {
            const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordMatched) {
                return res.status(400).send({
                    message: 'Old password is incorrect',
                })
            }
            else {
                await User.update({ password: await bcrypt.hash(password, 10) }, { where: { id } });
                return res.status(200).send({
                    message: 'Password changed successfully',
                    status: 'OK'
                })
            }
        }
        else {
            return res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }
    } catch (err) {
        return res.status(500).send({
            message: "Failed to changePassword",
            status: 'failed'
        })
    }
}

const changeStatus = async (req, res) => {   //change status of the user  
    try {
        const { id } = req.params;
        const { status } = req.body;
        const sts = [0, 1, 2]
        const user = await User.findOne({ where: { id } });
        if (user) {
            if (sts.includes(status)) {
                await User.update({ status }, { where: { id } });
                return res.status(200).send({
                    message: 'Status changed successfully',
                    status: 'OK'
                })
            }
            else {
                return res.status(400).send({
                    message: 'Invalid status',
                    status: 'failed'
                })
            }
        }
        else {
            return res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }
    } catch (err) {
        return res.status(500).send({
            message: "failed to Change status",
            status: 'failed'
        })
    }
}

const renewAccestoken = async (req, res) => {           //access token renew by refresh token
    try {
        const refreshToken = req.body.refresh;
        if (!refreshToken || !refreshTokens.includes(refreshToken)) {
            return res.status(403).send({
                message: "user Not Authenticated",
                status: "failed"
            })
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (!err) {
                const accessToken = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
                return res.status(200).send({
                    accessToken
                })
            } else {
                return res.status(403).send({
                    message: "user Not Authenticated",
                    status: "failed"
                })
            }

        })
    } catch (err) {
        return res.status(500).send({
            message: "something went wrong",
            status: 'failed'
        })
    }
}


//exporting controls
module.exports = { createUser, getAllUsers, userLogin, deleteUser, editUser, getUserbyID, changePassword, changeStatus, renewAccestoken };