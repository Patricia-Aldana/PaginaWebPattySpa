const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Servicio = require("../models/Servicio");

// validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ===============================
// OBTENER TODOS LOS SERVICIOS
// ===============================
router.get("/", async (req, res) => {
  try {
    const servicios = await Servicio.find().sort({ categoria: 1, nombre: 1 });
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
});

// ===============================
// CREAR SERVICIO
// ===============================
router.post("/", async (req, res) => {
  try {
    const nuevoServicio = new Servicio(req.body);
    await nuevoServicio.save();
    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear servicio" });
  }
});

// ===============================
// CREAR SERVICIOS POR DEFECTO
// ⚠️ ESTA RUTA DEBE IR ANTES DE LAS QUE USAN :id
// ===============================
router.get("/create-default", async (req, res) => {
  try {
    const existentes = await Servicio.countDocuments();

    if (existentes > 0) {
      return res.json({ message: "Ya existen servicios." });
    }

    const servicios = [
      {
        nombre: "Corte de Cabello Mujer",
        descripcion: "Incluye lavado y peinado",
        precio: 15000,
        duracionMinutos: 40,
        categoria: "Cabello",
        activo: true
      },
      {
        nombre: "Corte de Cabello Hombre",
        descripcion: "Incluye lavado",
        precio: 12000,
        duracionMinutos: 30,
        categoria: "Cabello",
        activo: true
      },
      {
        nombre: "Manicure",
        descripcion: "Servicio completo con esmaltado",
        precio: 18000,
        duracionMinutos: 45,
        categoria: "Uñas",
        activo: true
      },
      {
        nombre: "Pedicure",
        descripcion: "Limpieza profunda y esmaltado",
        precio: 20000,
        duracionMinutos: 50,
        categoria: "Uñas",
        activo: true
      },
      {
        nombre: "Masaje Relajante",
        descripcion: "Masaje corporal completo",
        precio: 40000,
        duracionMinutos: 60,
        categoria: "Spa",
        activo: true
      },
      {
        nombre: "Depilación de Cejas",
        descripcion: "Moldeado con cera o pinza",
        precio: 8000,
        duracionMinutos: 15,
        categoria: "Depilación",
        activo: true
      }
    ];

    await Servicio.insertMany(servicios);
    res.json({ message: "Servicios creados correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear servicios" });
  }
});

// ===============================
// TOGGLE ESTADO DE SERVICIO
// ===============================
router.put("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const servicio = await Servicio.findById(id);

    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    servicio.activo = !servicio.activo;

    await servicio.save();

    res.json(servicio);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar estado del servicio" });
  }
});

// ===============================
// ACTUALIZAR SERVICIO (PRECIO / DESCRIPCIÓN)
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const servicio = await Servicio.findById(id);

    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    if (req.body.precio !== undefined) {
      servicio.precio = req.body.precio;
    }

    if (req.body.descripcion !== undefined) {
      servicio.descripcion = req.body.descripcion;
    }

    await servicio.save();

    res.json(servicio);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar servicio" });
  }
});

module.exports = router;