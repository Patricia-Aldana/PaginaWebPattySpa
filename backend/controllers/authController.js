const Profesional = require("../models/Profesional");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secretdev";

// Crear token (versión moderna)
const jwtSign = (prof) =>
  jwt.sign(
    { id: prof._id, nombre: prof.nombre, email: prof.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );


// ===============================
//   REGISTRO DE PROFESIONAL
// ===============================
exports.register = async (req, res) => {
  try {
    const { nombre, especialidad, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    const existe = await Profesional.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const prof = new Profesional({
      nombre,
      especialidad: especialidad || "",
      email,
    });

    // método definido en el modelo (bcrypt)
    await prof.setPassword(password);
    await prof.save();

    const token = jwtSign(prof);

    res.json({
      success: true,
      message: "Profesional registrado",
      token,
      profesional: {
        id: prof._id,
        nombre: prof.nombre,
        email: prof.email,
      },
    });
  } catch (err) {
    console.error("❌ Error en register:", err);
    res.status(500).json({ message: "Error interno en el registro" });
  }
};



// ===============================
//         LOGIN
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const prof = await Profesional.findOne({ email });
    if (!prof) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const ok = await prof.validatePassword(password);
    if (!ok) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = jwtSign(prof);

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      profesional: {
        id: prof._id,
        nombre: prof.nombre,
        email: prof.email,
      },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ message: "Error interno al iniciar sesión" });
  }
};
