const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Cấu hình "Người giao thư" (Transporter)
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Định dạng bức thư
  const mailOptions = {
    from: '"TrueSmart Support" <noreply@truesmart.com>',
    to: options.email,
    subject: options.subject,
    html: options.message, // Dùng HTML để thư đẹp hơn
  };

  // 3. Gửi thư
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;