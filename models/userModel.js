const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name must be specified'],
    },
    email: {
      type: String,
      required: [true, 'Email must be specified'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Password must be specified'],
      minlength: 8,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Confirm password must be specified'],
      minlength: 8,
    },
  },
  { versionKey: false },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
