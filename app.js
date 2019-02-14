const express = require('express')
const axios = require('axios')
var imaps = require('imap-simple');
const {simpleParser} = require('mailparser')
const Email = require('./models/emails')
const mongoose = require('./db/mongoose')
const fs = require('fs')
const sendemail = require('emailjs')
const bodyParser = require('body-parser')

var app = express()

var sender = sendemail.server.connect({
  user: 'adienpiercetest@gmail.com',
  password: 'simplepassword',
  host: 'smtp.gmail.com',
  ssl: true
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json())

debugger

var config = {
    imap: {
        user: 'adienpiercetest@gmail.com',
        password: 'simplepassword',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 50000
    }
};

debugger

imaps.connect(config).then(function (connection) {
    connection.openBox('INBOX').then(function () {
        var searchCriteria = ['ALL']
        var fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false
        }
        connection.search(searchCriteria, fetchOptions).then(async function (results) {
          /**
           *Asnyc function to decode email body one by one sequentially
          */
          var emails = await Promise.all(results.map(async res => {
            var email = {}
              email.Subject = res.parts.filter((part) => part.which === 'HEADER')[0].body.subject[0]
              email.To = res.parts.filter((part) => part.which === 'HEADER')[0].body.to[0]
              email.Date = res.parts.filter((part) => part.which === 'HEADER')[0].body.date[0]
              var message = await simpleParser(res.parts.filter((part) => part.which === '')[0].body)
              email.FromName = message.from.value[0].name
              email.FromAddress = message.from.value[0].address
              email.Message = message.text
              return email
          }))
          
          connection.end()
          axios.post('http://127.0.0.1:5000/setsentiment', emails).then((response) => {
            response.data.forEach((eml) => {
              var newEmail = new Email(eml)
              newEmail.save().then((result) => {
                console.log('Saved Item To Database')
              }, (err) => {
                console.log('Error occured saving to database Check Error Log')
                fs.appendFileSync('./error.log',JSON.stringify(err)+'\n')
              })
            })
          }).catch((err) => {
            console.log('Error Sending or Receiving emails to Sentiment API')
            err.time = new Date().getTime()
            fs.appendFileSync('./error.log',JSON.stringify(err))
          })
        });
    });
}).catch((err) => {
  console.log('Error Connecting to Email Provider')
  err.time = new Date().getTime() 
  var error = JSON.stringify(err)+'\n'
  fs.appendFileSync('./error.log',error)
});

debugger

app.get('/emails', (req,res) => {
  console.log('Emails Requested')
  Email.find().then((emails) => {
    if(emails.length && emails.length > 0) {
      res.status(200).send(emails)
    } else {
      res.status(404).send('Nothing Found In Database')
    }
  },(err) => {
    res.status(500).send('Email API Error')
  })
})

app.post('/emails', (req,res) => {
  sender.send({
    text:     req.body.message, 
    from:     'adienpiercetest@gmail.com', 
    to:       req.body.address,
    subject:  req.body.subject
  }, (err,message) => {
    if (err) {
      res.status(500).send('Message Was Not Sent')
    } else {
      res.status(200).send('Message Was Sent')
    }
  })
})

app.listen(3000, () => {
  console.log('Server is up and running on port 3000')
})