const mongoose = require("mongoose");

const CitaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, default: "" },
    servicio: { type: String, required: true },

    profesional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profesional",
      required: true,
    },

    inicio: { type: Date, required: true },
    fin: { type: Date, required: true },

    // ⭐ NECESARIO PARA EL RECORDATORIO ⭐
    recordatorioEnviado: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cita", CitaSchema);
