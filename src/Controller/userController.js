const bcrypt = require("bcrypt");
const mongoose = require("mongoose")
const saltRound = 10
const userModel = require("../Model/UserModel")
const jwt = require("jsonwebtoken")
const { isValidName, isValidEmail, isValidPassword } = require("../middleware/validation")

//=================creating the user================

const createUser = async (req, res) => {
    try {
        let data = req.body

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide User Information for registering" })
        }

        const { name, email, password } = data

        if (!name || !email || !password) {
            return res.status(400).send({ status: false, message: "email & password is mandatory" })
        }
        
        if (!isValidName(name)) {
            return res.status(400).send({ status: false, message: "Name is invalid" });
        }        

        if (!isValidEmail(email) || !isValidPassword(password)) {
            return res.status(404).send({ status: false, message: "email & password is not valid" })
        }

        let emailExist = await userModel.findOne({ email: email });

        if (emailExist) {
            return res.status(400).send({ status: false, message: "User already exists. Please proceed to Log-in." })
        }
       
        let encryptedPassword = bcrypt.hash(req.body.password, saltRound).then((hash) => {
            // console.log(`Hash: ${hash}`);
            return hash;
        });

        req.body.password = await encryptedPassword;

        const User = await userModel.create(data);

        return res.status(201).send({ status: true, message: "User created successfully", data: User })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

//=====================Log-in=====================

const userLogin = async (req, res) => {
    try {
        let data = req.body

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please Provide data" })
        }

        const { email, password } = data

        if (!email || !password) {
            return res.status(400).send({ status: false, message: "email & password is mandatory" })
        }
        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Please Provide Valid Email " })
        }

        const Login = await userModel.findOne({ email });

        if (!Login)
            return res.status(404).send({ status: false, message: "Not a register email Id" });

        let decodePwd = await bcrypt.compare(password, Login.password);

        if (!decodePwd)
            return res.status(400).send({ status: false, message: "Password not match" });

        let token = jwt.sign(
            {
                userId: Login._id.toString(),
            },
            "UserLogin",
            { expiresIn: "10d" }
        );

        // let log

        return res.status(200).send({ status: true, message: "Teacher login successfull", data: { userId: Login._id, token: token }, })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = { createUser, userLogin }