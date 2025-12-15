const Servicio = require("../models/Servicio");

// listar todos
exports.list = async (req, res) => {
  try {
    const servicios = await Servicio.find();
    res.json(servicios);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo servicios" });
  }
};

// crear
exports.create = async (req, res) => {
  try {
    const servicio = new Servicio(req.body);
    await servicio.save();
    res.json(servicio);
  } catch (err) {
    res.status(500).json({ error: "Error creando servicio" });
  }
};

// actualizar
exports.update = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(servicio);
  } catch (err) {
    res.status(500).json({ error: "Error actualizando servicio" });
  }
};

// activar / desactivar
exports.toggle = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);

    servicio.activo = !servicio.activo;
    await servicio.save();

    res.json(servicio);
  } catch (err) {
    res.status(500).json({ error: "Error al cambiar estado" });
  }
};
