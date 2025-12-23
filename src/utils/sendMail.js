// utils/sendMail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "topbriefing36@gmail.com",
    pass: 'zxbc nnod mmtb kdjg',
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false
  }
});

module.exports = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"topbriefing36@gmail.com`,
    to,
    subject,
    html,
  });
};



