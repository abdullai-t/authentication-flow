const nodemailer = require('nodemailer');

let transport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
      secure: true,
      auth: {
          user: 'abdullai.tahiru@gmail.com',
          pass:'root2018' 
      }
  });

  module.exports = transport;