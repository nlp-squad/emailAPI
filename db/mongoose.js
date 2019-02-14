const mongoose = require('mongoose')

var options = {
  useNewUrlParser: true,
  useCreateIndex: true
}

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost:27017/EmailSentimentAnalysisApp',options)

module.exports = {mongoose}
