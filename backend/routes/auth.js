const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Usuario = require("../models/Usuario");

const router = express.Router();

const cleanText = (value) => String(value || "").trim();
const cleanEmail = (value) => cleanText(value).toLowerCase();

const publicUser = (usuario) => ({
  _id: usuario._id,
  nombre: usuario.nombre,
  email: usuario.email,
  role: usuario.role || "cliente",
});

/* -------------------------
   TEST
------------------------- */
router.get("/test", (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Ruta auth funcionando correctamente",
  });
});

/* -------------------------
   REGISTER
------------------------- */
router.post("/register", async (req, res) => {
  try {
    const nombre = cleanText(req.body.nombre);
    const email = cleanEmail(req.body.email);
    const password = cleanText(req.body.password);

    if (!nombre || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Nombre, correo y contraseña son obligatorios",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const existe = await Usuario.findOne({ email });

    if (existe) {
      return res.status(400).json({
        ok: false,
        message: "Este correo ya está registrado",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: passwordHash,
      role: "cliente",
    });

    await nuevoUsuario.save();

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      usuario: publicUser(nuevoUsuario),
    });
  } catch (error) {
    console.error("❌ Error register:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error en el servidor al registrar",
    });
  }
});

/* -------------------------
   LOGIN
------------------------- */
router.post("/login", async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = cleanText(req.body.password);

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Correo y contraseña son obligatorios",
      });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        message: "Correo o contraseña incorrectos",
      });
    }

    if (!usuario.password) {
      return res.status(500).json({
        ok: false,
        message: "El usuario no tiene contraseña registrada",
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(400).json({
        ok: false,
        message: "Correo o contraseña incorrectos",
      });
    }

    return res.status(200).json({
      ok: true,
      usuario: publicUser(usuario),
    });
  } catch (error) {
    console.error("❌ Error login:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error en el servidor al iniciar sesión",
    });
  }
});

/* -------------------------
   FORGOT PASSWORD
------------------------- */
router.post("/forgot-password", async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "El correo es obligatorio",
      });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(200).json({
        ok: true,
        message: "Si el correo existe, se enviará un enlace",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    usuario.resetToken = token;
    usuario.resetTokenExp = Date.now() + 3600000;

    await usuario.save();

    return res.status(200).json({
      ok: true,
      message: "Token generado",
      token,
    });
  } catch (error) {
    console.error("❌ Error forgot-password:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error en servidor",
    });
  }
});

module.exports = router;