// utils/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true ,
  
  auth: {
    user: "topbriefing36@gmail.com",
    pass: 'zxbc nnod mmtb kdjg',
  },
    tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false
  }
});

const sendVerificationEmail = async (email, token) => {
  const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"TopBriefing"`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification </h2>
    
      <p>Please verify your email by clicking below:</p>
      <a href="${verifyURL}" target="_blank">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <h2>your token ${token}</h2>
    `
  });
};


const sendPasswordResetEmail = async (email, token) => {
  const verifyURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"TopBriefing"`,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>

      <p>Please reset your password by clicking below:</p>
      <a href="${verifyURL}" target="_blank">Reset Password</a>
      <p>This link expires in 24 hours.</p>
      <h2>your token ${token}</h2>
    `
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
