const mongoose = require("mongoose");

const ServicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      default: "",
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    duracionMinutos: {
      type: Number,
      required: true,
      min: 1,
    },
    categoria: {
      type: String,
      default: "General",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Servicio", ServicioSchema, "servicios");
