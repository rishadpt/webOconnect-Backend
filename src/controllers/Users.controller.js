const db = require('../models/index');
const User = db.users;
const validation = require('../helpers/validation_schema')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//Create new user

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await validation.loginValidation.validateAsync(req.body);
        console.log(result);
        const user = await User.findOne({ where: { email } });

        if (user) {
            const isPasswordMatched = await bcrypt.compare(password, user.password);
            if (!isPasswordMatched) {
                res.status(401).send({
                    message: 'Invalid password',
                    status: "failed"
                })
            }
            const token = jwt.sign({ id: user.id, user: user.name }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
            const refreshtoken = jwt.sign({ id: user.id, user: user.name }, process.env.JWT_REFRESH_KEY, { expiresIn: '7d' })
            res.status(200).send({ status: "OK", message: "Login Successful", token: token, refresh: refreshtoken });
        } else {
            res.status(404).send({
                message: 'Login Failed',
                status: "failed"
            })
        }
    }

    catch (err) {
        if (err.isjoi) {
            res.status(400).send({
                message: err.details[0].message,
                status: "failed"
            })
        } else {
            res.status(500).send({
                message: err.toString(),
                status: "failed"
            })
        }
    }
}

const createUser = async (req, res) => {

    try {
        const { name, email, password, phone, gender } = req.body;  //destructuring the req.body
        const result = await validation.userScheme.validateAsync(name, email, password, phone, gender); //validating the req.body
        console.log(result)
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

        res.status(200).send({
            message: 'User created successfully',
            status: "OK"
        })

    } catch (err) {
        res.status(500).send({
            message: "Failed to Create user",
            status: "failed"
        })
    }
}

//Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({attributes: {exclude: ['password']}});
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({
            message: err.message
        })
    }
}

const getUserbyID = async (req, res) => {

    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { id } ,attributes: {exclude: ['password']}});
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }
    } catch (err) {
        res.status(500).send({
            message: err.message
        })
    }
}


const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { id } });
        if (user) {
            await User.destroy({ where: { id } });
            res.status(200).send({
                message: 'User deleted successfully',
                status: 'OK'
            })
        } else {
            res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }
    } catch (err) {
        res.status(500).send({
            message: "User not found",
            status: 'failed'
        })
    }
}

const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;
        const result = await validation.editValidation.validateAsync(req.body)
        const user = await User.findOne({ where: { id } });
        const isExistname = await User.findAll({ where: { name } });
        const isExistemail = await User.findAll({ where: { email } });
        const isExistphone = await User.findAll({ where: { phone } });
        if (user) {
            if (isExistname) {
                res.status(400).send({
                    message: 'Name already exists',
                    status: 'failed'
                })
            }
            else if (isExistemail) {
                res.status(400).send({
                    message: 'Email already exists',
                    status: 'failed'
                })
            }
            else if (isExistphone) {
                res.status(400).send({
                    message: 'Phone already exists',
                    status: 'failed'
                })
            } else {
                await User.update({ name, email, phone }, { where: { id } });
                res.status(200).send({
                    message: 'Profilers updated successfully',
                    status: 'OK'
                })
            }

        } else {
            res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }

    } catch (err) {
        res.status(500).send({
            message: "Failed to update user",
            status: 'failed'
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, oldPassword } = req.body;
        const result = await validation.changePassword.validateAsync(req.body)
        const user = await User.findOne({ where: { id } });
        if (user) {
            const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordMatched) {
                res.status(400).send({
                    message: 'Old password is incorrect',
                })
            }
            else {
                await User.update({ password: await bcrypt.hash(password, 10) }, { where: { id } });
                res.status(200).send({
                    message: 'Password changed successfully',
                    status: 'OK'
                })
            }
        }
        else {
            res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }
    } catch (err) {
        res.status(500).send({
            message: "Failed to changePassword",
            status: 'failed'
        })
    }
}

const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const sts = [0, 1, 2]
        const user = await User.findOne({ where: { id } });
        if (user) {
            if (sts.includes(status)) {
                await User.update({ status }, { where: { id } });
                res.status(200).send({
                    message: 'Status changed successfully',
                    status: 'OK'
                })
            }
            else {
                res.status(400).send({
                    message: 'Invalid status',
                    status: 'failed'
                })
            }
        }
        else {
            res.status(400).send({
                message: 'User not found',
                status: 'failed'
            })
        }
    } catch (err) {
        res.status(500).send({
            message: "failed to Change status",
            status: 'failed'
        })
    }
}


module.exports = { createUser, getAllUsers, userLogin, deleteUser, editUser, getUserbyID, changePassword, changeStatus };