const nodemailer = require("nodemailer");
require('dotenv').config();

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"CodeHub" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: text, // not plain text, you're sending HTML
  });
};

module.exports = sendEmail;
