const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Usuario = require("../models/Usuario");
// Importamos la utilidad que ya funciona en tu app.js
const { sendBrevoEmail } = require("../utils/brevoMailer");

const router = express.Router();

/* -------------------------
    HELPERS ORIGINALES
------------------------- */
const cleanText = (value) => String(value || "").trim();
const cleanEmail = (value) => cleanText(value).toLowerCase();

const publicUser = (usuario) => ({
  _id: usuario._id,
  nombre: usuario.nombre,
  email: usuario.email,
  role: usuario.role || "cliente",
});

/* -------------------------
    LÓGICA DE ENVÍO (BREVO)
------------------------- */
const enviarCorreoRecuperacion = async (email, token) => {
  // CAMBIO REALIZADO: Lógica dinámica para el enlace según el entorno
  const UI_URL = process.env.NODE_ENV === "production" 
    ? "https://pagina-web-patty-spa.vercel.app" 
    : "http://localhost:3000";

  const link = `${UI_URL}/reset-password/${token}`;

  return await sendBrevoEmail({
    to: email,
    toName: "Usuario Patty Spa",
    subject: "Recuperación de contraseña - Patty Spa",
    textContent: `Haz clic aquí para restablecer tu contraseña: ${link}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #7b2cbf;">Recuperar contraseña</h2>
        <p>Has solicitado restablecer tu contraseña en <strong>Patty Spa</strong>.</p>
        <p>Haz clic en el botón de abajo para continuar:</p>
        <a href="${link}" style="background-color: #7b2cbf; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer mi contraseña</a>
        <p>Este enlace expira en 1 hora.</p>
      </div>
    `,
  });
};

/* -------------------------
    RUTAS (REGISTER / LOGIN)
------------------------- */

router.post("/register", async (req, res) => {
  try {
    const nombre = cleanText(req.body.nombre);
    const email = cleanEmail(req.body.email);
    const password = cleanText(req.body.password);
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ ok: false, message: "Este correo ya está registrado" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const nuevoUsuario = new Usuario({ nombre, email, password: passwordHash, role: "cliente" });
    await nuevoUsuario.save();

    return res.status(201).json({ ok: true, usuario: publicUser(nuevoUsuario) });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = cleanText(req.body.password);
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ ok: false, message: "Correo o contraseña incorrectos" });

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) return res.status(400).json({ ok: false, message: "Correo o contraseña incorrectos" });

    return res.status(200).json({ ok: true, usuario: publicUser(usuario) });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

/* -------------------------
    RUTAS DE CONTRASEÑA
------------------------- */

// 1. Enviar el enlace
router.post("/forgot-password", async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const usuario = await Usuario.findOne({ email });
    
    if (!usuario) {
        return res.status(200).json({ ok: true, message: "Si el correo existe, se enviará un enlace" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    usuario.resetToken = token;
    usuario.resetTokenExp = Date.now() + 3600000; 
    await usuario.save();

    await enviarCorreoRecuperacion(email, token);
    return res.status(200).json({ ok: true, message: "Correo de recuperación enviado" });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
});

// 2. Guardar la nueva clave (ESTA ES LA RUTA QUE TE DABA ERROR 404)
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!usuario) {
        return res.status(400).json({ ok: false, message: "Token inválido o expirado" });
    }

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.resetToken = undefined;
    usuario.resetTokenExp = undefined;
    await usuario.save();

    return res.status(200).json({ ok: true, message: "Contraseña actualizada con éxito" });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al actualizar contraseña" });
  }
});

module.exports = router;