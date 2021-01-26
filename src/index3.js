const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const app = express();
const path = require('path');

var port = process.env.PORT || 3002;

app.use(express.static(path.join(__dirname,'public')));

app.use(express.json());
app.use(express.urlencoded());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

const oauth2Client = new OAuth2(
    '769307884708-bqmq48qtt3st1q147k5lph62ok7ftkcm.apps.googleusercontent.com',
    'koHX3gk2DU78kT58XyymLmVk', // Client Secret
    'https://developers.google.com/oauthplayground'// Redirect URL
);


oauth2Client.setCredentials({
    refresh_token: '1//04xdoAWFGwpEkCgYIARAAGAQSNwF-L9IrqguAqnM6rafPk3T_gaQ2ajuaeuGrFDJKv4eFCAVbTJXi6tbov8iJFccR1crGnWJek_g',
});
const accessToken = oauth2Client.getAccessToken()


const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: "lospatiosformularios@gmail.com", 
         clientId: "769307884708-bqmq48qtt3st1q147k5lph62ok7ftkcm.apps.googleusercontent.com",
         clientSecret: "koHX3gk2DU78kT58XyymLmVk",
         refreshToken: "1//04xdoAWFGwpEkCgYIARAAGAQSNwF-L9IrqguAqnM6rafPk3T_gaQ2ajuaeuGrFDJKv4eFCAVbTJXi6tbov8iJFccR1crGnWJek_g",
         accessToken: accessToken
    }
});
 
const mailOptions = {
    from: "lospatiosformularios@gmail.com",
    to: "developer.projas@gmail.com",
    subject: "Node.js Email with Secure OAuth",
    generateTextFromHTML: true,
    html: "<b>test</b>"
};

smtpTransport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    smtpTransport.close();
});

  // start the server
  app.listen(port);