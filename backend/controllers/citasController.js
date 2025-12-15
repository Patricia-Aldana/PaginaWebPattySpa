const Cita = require("../models/Cita");

const duraciones = {
  manicure: 35,
  pedicure: 45,
  tinte: 90,
  corte: 60,
  facial: 50,
  depilacion: 30,
  esmaltado: 30,
};

function parseDateTime(fecha, hora) {
  return new Date(`${fecha}T${hora}:00`);
}

exports.create = async (req, res) => {
  try {
    const {
      nombre,
      email = "",
      fecha,
      hora,
      servicio,
      profesional,
      profesionalId,
    } = req.body;

    const profID = profesional || profesionalId;

    // Validar datos obligatorios
    if (!nombre || !fecha || !hora || !servicio || !profID) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos para agendar la cita",
      });
    }

    const duracion = duraciones[servicio] || 30;

    const inicio = parseDateTime(fecha, hora);
    const fin = new Date(inicio.getTime() + duracion * 60000);

    // Validar cruce de horarios
    const solapada = await Cita.findOne({
      profesional: profID,
      inicio: { $lt: fin },
      fin: { $gt: inicio },
    });

    if (solapada) {
      return res.status(400).json({
        success: false,
        message: "⛔ Esta hora ya está ocupada. Por favor elige otra hora.",
      });
    }

    // Crear cita
    const nueva = new Cita({
      nombre,
      email,
      servicio,
      profesional: profID,
      inicio,
      fin,
    });

    await nueva.save();

    return res.json({
      success: true,
      message: "Cita agendada con éxito",
      cita: nueva,
    });
  } catch (e) {
    console.error("ERROR CREAR CITA:", e);
    return res.status(500).json({
      success: false,
      message: "Error interno al crear la cita",
    });
  }
};

// Listar todas las citas
exports.listAll = async (_req, res) => {
  const citas = await Cita.find()
    .populate("profesional", "nombre especialidad")
    .sort({ inicio: 1 });

  res.json(citas);
};

// Eliminar cita
exports.delete = async (req, res) => {
  await Cita.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Cita eliminada" });
};
