const Profesional = require("../models/Profesional");

exports.list = async (req, res) => {
  try {
    const list = await Profesional.find().sort({ nombre: 1 });
    res.json(list);
  } catch (error) {
    console.error("❌ ERROR LISTANDO PROFESIONALES:", error);
    res.status(500).json({
      message: "Error obteniendo profesionales",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const prof = await Profesional.findById(req.params.id);
    if (!prof) {
      return res.status(404).json({ message: "No encontrado" });
    }
    res.json(prof);
  } catch (error) {
    console.error("❌ ERROR OBTENIENDO PERFIL:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const prof = req.profesional;
    const { nombre, especialidad, fotoUrl, activo } = req.body;

    if (nombre) prof.nombre = nombre;
    if (especialidad) prof.especialidad = especialidad;
    if (fotoUrl) prof.fotoUrl = fotoUrl;
    if (typeof activo === "boolean") prof.activo = activo;

    await prof.save();
    res.json(prof);
  } catch (error) {
    console.error("❌ ERROR ACTUALIZANDO PERFIL:", error);
    res.status(500).json({ message: "Error interno" });
  }
};
