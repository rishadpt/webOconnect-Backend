const express = require('express')
const router = express.Router()
const userHelper = require('../controllers/users.controller')
const authverify = require('../middlewares/userVerifier')

router.post('/create', userHelper.createUser)
router.get('/all', authverify.verifyToken, userHelper.getAllUsers)
router.post('/login', userHelper.userLogin)
router.delete('/delete/:id', authverify.verifyToken, userHelper.deleteUser)
router.get('/:id', authverify.verifyToken, userHelper.getUserbyID)
router.patch('/edit/:id', authverify.verifyToken, userHelper.editUser)
router.patch('/changepassword/:id', authverify.verifyToken, userHelper.changePassword)
router.delete('/delete/:id', authverify.verifyToken, userHelper.deleteUser)
router.patch('/status/:id', authverify.verifyToken, userHelper.changeStatus)
router.post('/renew', authverify.verifyToken, userHelper.renewAccestoken)
module.exports = router;