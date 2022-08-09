const express = require('express')
const router = express.Router()
const userHelper = require('../controllers/users.controller')


router.post('/create', userHelper.createUser)
router.get('/all', userHelper.getAllUsers)   
router.post('/login', userHelper.userLogin)
router.delete('/delete/:id', userHelper.deleteUser)
router.get('/:id', userHelper.getUserbyID)
module.exports = router;