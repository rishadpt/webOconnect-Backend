const db = require('../models/index');
const User = db.users;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//Create new user

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (user) {
            const isPasswordMatched = await bcrypt.compare(password, user.password);
            if (!isPasswordMatched) {
                res.status(401).send({
                    message: 'Invalid password'
                })
            }
            const token = jwt.sign({ id: user.id, user: user.name }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
            const refreshtoken = jwt.sign({ id: user.id, user: user.name }, process.env.JWT_REFRESH_KEY, { expiresIn: '7d' })
            res.status(200).send({ message: "Login Successful", token: token, refresh: refreshtoken });
        } else {
            res.status(400).send({
                message: 'Login Failed',
            })
        }
    }

    catch (err) {
        res.status(503).send({
            message: err.message
        })
    }
}

const createUser = async (req, res) => {

    try {
        const { name, email, password, phone, gender } = req.body;  //destructuring the req.body
        console.log(req.body);

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
        })

    } catch (err) {
        res.status(503).send({
            message: err.message
        })
    }
}

//Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).send(users);
    } catch (err) {
        res.status(503).send({
            message: err.message
        })
    }
}

const getUserbyID = async (req, res) => {

    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { id } });
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(400).send({
                message: 'User not found',
            })
        }
    } catch (err) {
        res.status(503).send({
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
            })
        } else {
            res.status(400).send({
                message: 'User not found',
            })
        }
    } catch (err) {
        res.status(503).send({
            message: err.message
        })
    }
}

const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, phone } = req.body;
        const user = await User.findOne({ where: { id } });
        if (user) {
            await User.update({ name, email, password, phone }, { where: { id } });
            res.status(200).send({
                message: 'User updated successfully',
            })
        } else {
            res.status(400).send({
                message: 'User not found',
            })
        }

    } catch (err) {
        res.status(503).send({
            message: err.message
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, oldPassword } = req.body;
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
                })
            }
        }
        else {
            res.status(400).send({
                message: 'User not found',
            })
        }
    } catch (err) {
        res.status(503).send({
            message: err.message
        })
    }
}



module.exports = { createUser, getAllUsers, userLogin, deleteUser, editUser, getUserbyID, changePassword };