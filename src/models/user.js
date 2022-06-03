const mongoose = require("mongoose");
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
        if (!validator.isEmail(value)) {
            throw new Error('Email is invalid')
        }
    }
  },
  age: {
    type: Number,
    dafault: 0,
    validate(value) {
      if (value < 0) {
        throw new Error("Age must be a positive number");
      }
    },
  },
  password: {
      type: String,
      required: true,
      minLength: 7,
      trim: true,
      validate(value) {
          if (value.toLowerCase().includes('password')) {
              throw new Error('Password cannot contain "password"')
          }
      }
  },
  tokens: [{
    token:{
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer // Binary image data
  }
}, {
  timestamps: true
})

// Virtual attributes are not stored in user document
// Mongoose generates the relationship
// The relationship is between the user's id and the Task's owner field
userSchema.virtual('tasks', {
  ref: 'Task',
  // Where the local data is stored in the user
  localField: '_id',
  // Name of the field on the task that creates the reference
  foreignField: 'owner'
})

// The toJSON method is a special property on objects
// It is called when you call res.send that uses JSON.stringify() on that object
// Whatever the toJSON method returns is what will be returned from calling JSON.stringify() on that object
userSchema.methods.toJSON = function() {
  const user = this

  // Removes metadata and methods
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

// Methods are accessible for instances
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

// Statics methods are accessible for models 
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })

  if(!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this
  
  if(user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this

  await Task.deleteMany({ owner: user._id })

  next()
})

const User = mongoose.model("User", userSchema);

User.createIndexes()

module.exports = User