require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: process.env.Email_Host,
    port: process.env.Email_Port,
    secure: true,
    auth: {
      user: process.env.Email_User, 
      pass:process.env.Email_pass, 
    },
  });
module.exports = transporter;