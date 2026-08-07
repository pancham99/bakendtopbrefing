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
});

module.exports = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Topbriefing latest news" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};



