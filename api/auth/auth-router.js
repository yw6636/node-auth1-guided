const express = require('express')
const bcrypt = require('bcryptjs')
const bcryptjs = require('bcryptjs')
const router = express.Router()
const User = require('../users/users-model')

router.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body
        const hash = bcrypt.hashSync(password, 8)
        const newUser = { username, password: hash}
        const result = await User.add(newUser)
        res.status(201).json({
            message: `nice to have you, ${result.username}`
        })
    } catch (err) {
        next(err)   
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body
        const [user] = await User.findBy({ username })
        if (user && bcryptjs.compareSync(password, user.password)) {
            // start session
            req.session.user = user
            res.json({ message: `Welcome back, ${user.username}`})
        } else {
            next ({ status: 401, message: 'bad credentials'})
        }
    } catch (err) {
        next(err)
    }
})

router.get('/logout', async (req, res, next) => {
    if (req.session.user) {
        const { username } = req.session.user
        req.session.destroy(err => {
            if (err) {
                res.json({ message: `You can never leave, ${username}`})
            } else {
                res.set('Set-Cookie', 'monkey=; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00')
                res.json({ message: `Good Bye ${username}`})
            }
        })
    } else {
        res.json({ message: 'Sorry, have we met?'})
    }
})

module.exports = router