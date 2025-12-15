const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((err) => {
  if (err) console.error("❌ Error al verificar transportador de correo:", err);
  else console.log("✅ Transportador de correo listo");
});

async function enviarCorreo(to, subject, html) {
  if (!to) return;
  try {
    await transporter.sendMail({
      from: `"Patty Spa" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✉️ Correo enviado a ${to}`);
  } catch (e) {
    console.error("❌ Error enviando correo:", e);
  }
}

module.exports = { enviarCorreo };
