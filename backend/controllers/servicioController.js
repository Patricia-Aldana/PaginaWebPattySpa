const servicios = await Servicio.find({ activo: true }).sort({ nombre: 1 });

// =======================
// LISTAR SERVICIOS
// =======================
exports.list = async (req, res) => {
  try {
    const servicios = await Servicio.find().sort({ nombre: 1 });
    res.json(servicios);
  } catch (err) {
    console.error("❌ Error obteniendo servicios:", err);
    res.status(500).json({ error: "Error obteniendo servicios" });
  }
};

// =======================
// CREAR SERVICIO
// =======================
exports.create = async (req, res) => {
  try {
    const servicio = new Servicio(req.body);
    await servicio.save();
    res.json(servicio);
  } catch (err) {
    console.error("❌ Error creando servicio:", err);
    res.status(500).json({ error: "Error creando servicio" });
  }
};

// =======================
// ACTUALIZAR SERVICIO
// =======================
exports.update = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(servicio);
  } catch (err) {
    console.error("❌ Error actualizando servicio:", err);
    res.status(500).json({ error: "Error actualizando servicio" });
  }
};

// =======================
// ACTIVAR / DESACTIVAR
// =======================
exports.toggle = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    servicio.activo = !servicio.activo;
    await servicio.save();

    res.json(servicio);
  } catch (err) {
    console.error("❌ Error cambiando estado:", err);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
};
