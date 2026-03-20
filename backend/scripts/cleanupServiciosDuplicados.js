require("dotenv").config();
const mongoose = require("mongoose");
const Servicio = require("../models/Servicio");

const normalizar = (t) => (t || "").trim().toLowerCase().replace(/\s+/g, " ");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    const todos = await Servicio.find({}, { nombre: 1 }).lean();
    const grupos = new Map();

    for (const s of todos) {
      const key = normalizar(s.nombre);
      if (!key) continue;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key).push(s._id);
    }

    let borrados = 0;

    for (const [key, ids] of grupos.entries()) {
      if (ids.length <= 1) continue;

      // Mantener el más nuevo (ObjectId más grande)
      const ordenados = ids.map(String).sort();
      const keep = ordenados[ordenados.length - 1];
      const toDelete = ordenados.slice(0, -1);

      const result = await Servicio.deleteMany({ _id: { $in: toDelete } });
      borrados += result.deletedCount || 0;

      console.log(`🧹 "${key}" => se mantiene ${keep}, se borran ${toDelete.length}`);
    }

    console.log(`✅ Limpieza terminada. Eliminados: ${borrados}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();