const mongoose = require("mongoose");

const ServicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, default: "" },
  precio: { type: Number, required: true },
  duracionMinutos: { type: Number, default: 30 },
  activo: { type: Boolean, default: true },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Servicio", ServicioSchema);
