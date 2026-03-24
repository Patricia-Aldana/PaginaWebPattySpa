const { sendBrevoEmail, isBrevoConfigured } = require("./brevoMailer");

const sendEmail = async (...args) => {
  return sendBrevoEmail(...args);
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.sendMail = sendEmail;
module.exports.enviarCorreo = sendEmail;
module.exports.sendBrevoEmail = sendEmail;
module.exports.isBrevoConfigured = isBrevoConfigured;