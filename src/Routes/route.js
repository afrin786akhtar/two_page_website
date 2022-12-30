const express = require('express')
const router = express.Router()
const userController = require('../Controller/userController')

//----------------Dummy API-------------
router.get('/test', function (req, res) {
    return res.send({ status: true, msg: "running" })
})

router.post("/createUser", userController.createUser)

router.post("/login" , userController.userLogin)

module.exports = router