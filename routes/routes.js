const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrpt = require('bcrypt')
const User = require('../models/User')
require('dotenv').config()



const checkToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ message: 'Access denied' })
    }

    try {
        const secretCode = process.env.SECRET
        jwt.verify(token, secretCode)
        next()
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' })
    }
}
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Home router OK' })
})

router.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body


    if (!name) {
        return res.status(422).json({ message: "Name is required!" })
    }
    if (!email) {
        return res.status(422).json({ message: "Email is required!" })
    }
    if (!password) {
        return res.status(422).json({ message: "Password is required!" })
    }

    if (password !== confirmpassword) {
        return res.status(422).json({ message: "Password and confirmation password is not match" })
    }

    //Check if user exists

    const userExists = await User.findOne({ email: email })

    if (userExists) {
        return res.status(422).json({ message: 'Email already in use' })
    }

    //create password
    const salt = await bcrpt.genSalt(12)
    const passwordHash = await bcrpt.hash(password, salt)

    //create user
    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try {
        await user.save()
        res.status(201).json({ message: 'User has been created successfully' })

    } catch (err) {

        res.status(500).json({ message: "Server error" })
    }
})

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body
    if (!email) {
        return res.status(422).json({ message: "Email is required!" })
    }
    if (!password) {
        return res.status(422).json({ message: "Password is required!" })
    }

    //Check if user exist
    const user = await User.findOne({ email: email })
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    //Check if password match
    const checkPassword = await bcrpt.compare(password, user.password)

    if (!checkPassword) {
        return res.status(422).json({ message: "Wrong password" })
    }

    try {
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id,
        }, secret
        )

        res.status(200).json({ message: "Authentication successful", token, id: user._id })
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        })
    }
})

router.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id

    //check if user exists
    const user = await User.findById(id, '-password') 

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ user })
})

module.exports = router