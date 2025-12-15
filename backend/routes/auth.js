const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");

// Registro
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    console.log("Datos recibidos en /register:", { nombre, email, password });

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const nuevo = new Usuario({
      nombre,
      email,
      password: hashed,
    });

    await nuevo.save();

    res.json({ message: "Registro exitoso" });

  } catch (error) {
    console.error("Error registrando usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
