const Profesional = require("../models/Profesional");

exports.list = async (req, res) => {
  const list = await Profesional.find().select("-passwordHash").sort({ nombre: 1 });
  res.json(list);
};

exports.getProfile = async (req, res) => {
  const prof = await Profesional.findById(req.params.id).select("-passwordHash");
  if (!prof) return res.status(404).json({ message: "No encontrado" });
  res.json(prof);
};

exports.updateProfile = async (req, res) => {
  const prof = req.profesional;
  const { nombre, especialidad, fotoUrl, activo } = req.body;
  if (nombre) prof.nombre = nombre;
  if (especialidad) prof.especialidad = especialidad;
  if (fotoUrl) prof.fotoUrl = fotoUrl;
  if (typeof activo === "boolean") prof.activo = activo;
  await prof.save();
  res.json(prof);
};
