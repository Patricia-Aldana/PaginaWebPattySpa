const express = require("express");
const router = express.Router();
const Profesional = require("../models/Profesional");

// Obtener profesionales
router.get("/", async (req, res) => {
  try {
    const activoQuery = String(req.query.activo || "").trim().toLowerCase();
    const filtro = {};

    if (activoQuery === "true") {
      filtro.activo = true;
    }

    const profesionales = await Profesional.find(filtro)
      .select("nombre especialidad activo fotoUrl createdAt createdAt creadoEn")
      .sort({ nombre: 1 })
      .lean();

    return res.json({
      ok: true,
      profesionales,
    });
  } catch (err) {
    console.error("❌ Error obteniendo profesionales:", err);
    return res.status(500).json({
      ok: false,
      message: "Error obteniendo profesionales",
    });
  }
});

// Activar / desactivar profesional
router.put("/:id/estado", async (req, res) => {
  try {
    const { activo } = req.body;

    const profesional = await Profesional.findByIdAndUpdate(
      req.params.id,
      { activo: !!activo },
      { new: true }
    ).select("nombre especialidad activo fotoUrl createdAt creadoEn");

    if (!profesional) {
      return res.status(404).json({
        ok: false,
        message: "Profesional no encontrado",
      });
    }

    return res.json({
      ok: true,
      profesional,
    });
  } catch (err) {
    console.error("❌ Error al cambiar estado:", err);
    return res.status(500).json({
      ok: false,
      message: "Error al cambiar estado",
    });
  }
});

module.exports = router;