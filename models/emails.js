const mongoose = require('mongoose')

var Email = mongoose.model('Email', {
  To: {
    type: String
  },
  FromAddress: {
    type: String
  },
  FromName: {
    type: String
  },
  Date: {
    type: String
  },
  Message: {
    type: String,
    unique: true
  },
  Class: {
    type: String
  },
  Subject: {
    type: String
  }
})

module.exports = Email