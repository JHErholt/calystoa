const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  appId: {
    type: Number,
    required: true,
  },
  appName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  screenshots: {
    type: Array,
    default: []
  },
  content: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  playtime: {
    type: Number,
  }
});

module.exports = mongoose.model('article', Schema);