const mongoose = require("mongoose");

const citaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    telefono: {
      type: String,
      default: "",
      trim: true,
    },

    celular: {
      type: String,
      default: "",
      trim: true,
    },

    servicioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Servicio",
      default: null,
    },

    servicioNombre: {
      type: String,
      default: "",
      trim: true,
    },

    servicio: {
      type: String,
      default: "",
      trim: true,
    },

    profesionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profesional",
      default: null,
    },

    profesionalNombre: {
      type: String,
      default: "",
      trim: true,
    },

    profesional: {
      type: String,
      default: "",
      trim: true,
    },

    inicio: {
      type: Date,
      required: true,
    },

    fin: {
      type: Date,
      required: true,
    },

    fecha: {
      type: String,
      default: "",
      trim: true,
    },

    hora: {
      type: String,
      default: "",
      trim: true,
    },

    duracionMinutos: {
      type: Number,
      default: 30,
      min: 1,
    },

    estado: {
      type: String,
      enum: ["reservada", "confirmada", "cancelada", "completada"],
      default: "reservada",
    },

    notas: {
      type: String,
      default: "",
      trim: true,
    },

    observaciones: {
      type: String,
      default: "",
      trim: true,
    },

    recordatorioEnviado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

citaSchema.index({ usuarioId: 1, inicio: -1 });
citaSchema.index({ email: 1, inicio: -1 });
citaSchema.index({ profesionalId: 1, inicio: 1, fin: 1 });

module.exports = mongoose.model("Cita", citaSchema);