const express = require("express");
const router = express.Router();
const Servicio = require("../models/Servicio.js");

// 🔹 RUTA PARA CREAR AUTOMÁTICAMENTE LOS SERVICIOS
// ⚠️ Los precios están guardados como NÚMEROS en PESOS COLOMBIANOS (COP)
// El formato de moneda se maneja en el FRONTEND
router.get("/create-default", async (req, res) => {
  try {
    const servicios = [
      { nombre: "Corte de Cabello Mujer", descripcion: "Incluye lavado y peinado", precio: 15000, duracionMinutos: 40, activo: true },
      { nombre: "Corte de Cabello Hombre", descripcion: "Incluye lavado", precio: 12000, duracionMinutos: 30, activo: true },
      { nombre: "Manicure", descripcion: "Servicio completo con esmaltado", precio: 18000, duracionMinutos: 45, activo: true },
      { nombre: "Pedicure", descripcion: "Limpieza profunda y esmaltado", precio: 20000, duracionMinutos: 50, activo: true },
      { nombre: "Masaje Relajante", descripcion: "Masaje corporal completo", precio: 40000, duracionMinutos: 60, activo: true },
      { nombre: "Depilación de Cejas", descripcion: "Moldeado con cera o pinza", precio: 8000, duracionMinutos: 15, activo: true }
    ];

    const result = await Servicio.insertMany(servicios);
    res.json({ message: "Servicios creados correctamente", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron crear los servicios" });
  }
});

// 🔹 Obtener todos los servicios
router.get("/", async (req, res) => {
  try {
    const servicios = await Servicio.find();
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
});

// 🔹 Crear servicio manualmente
router.post("/", async (req, res) => {
  try {
    const nuevoServicio = new Servicio(req.body);
    await nuevoServicio.save();
    res.json(nuevoServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear servicio" });
  }
});

// 🔹 Activar / Desactivar servicio
router.put("/:id/toggle", async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    servicio.activo = !servicio.activo;
    await servicio.save();
    res.json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

module.exports = router;
