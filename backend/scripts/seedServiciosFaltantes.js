require("dotenv").config();
const mongoose = require("mongoose");
const Servicio = require("../models/Servicio");

const serviciosFaltantes = [
  {
    nombre: "Manicura Tradicional",
    descripcion: "Corte, limado, limpieza y esmaltado con productos de primera. Tratamiento nutritivo para las cutículas.",
    precio: 25000,
    duracionMinutos: 45,
    activo: true,
  },
  {
    nombre: "Pedicura Profesional",
    descripcion: "Exfoliación, hidratación profunda y esmaltado con acabado duradero. Relajación y cuidado integral de pies.",
    precio: 30000,
    duracionMinutos: 50,
    activo: true,
  },
  {
    nombre: "Tinte de Cabello",
    descripcion: "Coloración profesional con productos que respetan la fibra capilar. Consulta previa para mejor resultado.",
    precio: 90000,
    duracionMinutos: 90,
    activo: true,
  },
  {
    nombre: "Depilación Corporal",
    descripcion: "Técnicas suaves y efectivas para pieles sensibles. Terminación hidratante para evitar irritaciones.",
    precio: 50000,
    duracionMinutos: 40,
    activo: true,
  },
  {
    nombre: "Esmalte Semipermanente",
    descripcion: "Acabado brillante y duradero, sin descamar. Ideal para quienes buscan duración y brillo profesional.",
    precio: 20000,
    duracionMinutos: 60,
    activo: true,
  },
  {
    nombre: "Pack Facial Rejuvenecedor",
    descripcion: "Limpieza profunda, mascarilla hidratante, masaje facial y protección para una piel luminosa y suave.",
    precio: 45000,
    duracionMinutos: 60,
    activo: true,
  },
];

const normalizar = (t) => (t || "").trim().toLowerCase().replace(/\s+/g, " ");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    let insertados = 0;

    for (const s of serviciosFaltantes) {
      const existe = await Servicio.findOne({
        nombre: { $regex: new RegExp(`^${s.nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      });

      if (!existe) {
        await Servicio.create(s);
        insertados++;
        console.log("➕ Insertado:", s.nombre);
      } else {
        console.log("ℹ️ Ya existe:", s.nombre);
      }
    }

    console.log(`✅ Terminado. Insertados: ${insertados}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();