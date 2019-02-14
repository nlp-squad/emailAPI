var imaps = require('imap-simple');
const {simpleParser} = require('mailparser')

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

imaps.connect(config).then(function (connection) {
    return connection.openBox('INBOX').then(function () {
        var searchCriteria = ['ALL']
        var fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false
        }
 
        return connection.search(searchCriteria, fetchOptions).then(async function (results) {
          /**
           *Asnyc function to decode email body one by one sequentially
          */
          var emails = await Promise.all(results.map(async res => {
            var email = {}
              email.subject = res.parts.filter((part) => part.which === 'HEADER')[0].body.subject[0]
              email.to = res.parts.filter((part) => part.which === 'HEADER')[0].body.to[0]
              email.from = res.parts.filter((part) => part.which === 'HEADER')[0].body.from[0]
              email.date = res.parts.filter((part) => part.which === 'HEADER')[0].body.date[0]
              let message = await simpleParser(res.parts.filter((part) => part.which === '')[0].body)
              email.message = message.text
              return email
          }))

          return emails

            /**
               emails ==> [  { 
                      subject: 'Vacation Test',
                      to: 'adienpiercetest@gmail.com',
                      from: 'Tawanda Mahuni <blessedmahuni@gmail.com>',
                      date: 'Wed, 6 Feb 2019 12:48:04 +0200',
                      message: 'Testing to see if project still works\n' 
                    },
                    { 
                      subject: 'Vacation test 2',
                      to: 'adienpiercetest@gmail.com',
                      from: 'Tawanda Mahuni <blessedmahuni@gmail.com>',
                      date: 'Wed, 6 Feb 2019 12:49:29 +0200',
                      message: 'Is this thing still working\n' 
                    } 
                ]
            */
            connection.end()
        });
    });
}).catch( (err) => {
  return err
});


