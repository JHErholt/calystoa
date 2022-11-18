const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  steam_id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
  },
  photos: {
    small: { type: String, default: '' },
    large: { type: String, default: '' }
  },
});

module.exports = mongoose.model('user', Schema);