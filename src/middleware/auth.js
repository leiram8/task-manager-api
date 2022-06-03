const jwt = require('jsonwebtoken')
const User = require('../models/user')

// If next is executed, the user is authenticated and the router function is called
const auth = async (req, res, next) => {
    try {
        // Get token from the req header
        const token = req.header('Authorization').replace('Bearer ', '')

        // Decode user info form token
        const decoded = jwt.verify(token, process.env.JTW_SECRET)

        // Match user id with auth token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        
        if (!user) {
            throw new Error()
        }

        // Attach user and token objects to the req
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
    
}

module.exports = auth