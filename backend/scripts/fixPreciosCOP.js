require("dotenv").config();
const mongoose = require("mongoose");
const Servicio = require("../models/Servicio");

function extraerNumero(valor) {
  if (typeof valor === "number") return valor;
  if (typeof valor !== "string") return NaN;

  const cleaned = valor.replace(/[^\d]/g, "");
  if (!cleaned) return NaN;

  return Number(cleaned);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✔ Conectado a MongoDB");

    const servicios = await Servicio.find({});
    let count = 0;

    for (const s of servicios) {
      const original = s.precio;
      const newVal = extraerNumero(original);

      if (!Number.isNaN(newVal) && newVal !== original) {
        s.precio = newVal;
        await s.save();
        count++;
        console.log(`Arreglado: ${s.nombre} -> ${newVal}`);
      }
    }

    console.log(`✔ Precios corregidos: ${count}`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();