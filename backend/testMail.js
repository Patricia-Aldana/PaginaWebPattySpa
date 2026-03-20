require("dotenv").config();
const nodemailer = require("nodemailer");

async function enviarPrueba() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verifica conexión
    await transporter.verify();
    console.log("📬 Servidor de correo listo");

    // Envía correo de prueba
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // te lo envías a ti misma
      subject: "Prueba Patty Spa",
      text: "Este es un correo de prueba desde nodemailer",
    });

    console.log("✅ Correo enviado:", info.response);
  } catch (err) {
    console.error("❌ Error enviando correo:", err);
  }
}

enviarPrueba();
