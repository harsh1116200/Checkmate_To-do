const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, 
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 
  },
  password: {
    type: String,
    required: true,
    minlength: 8, 
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
