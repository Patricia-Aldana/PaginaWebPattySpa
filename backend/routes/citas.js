const express = require("express");
const router = express.Router();
const citasController = require("../controllers/citasController");

// Crear cita
router.post("/agendamiento", citasController.create);

// Mis citas del cliente
router.get("/mis-citas", citasController.listMine);

// Todas las citas (panel admin)
router.get("/", citasController.listAll);

// Cancelar cita (solo con 6 horas o más)
router.delete("/:id/cancelar", citasController.cancelar);

// Eliminar cita (admin)
router.delete("/:id", citasController.deleteCita);

module.exports = router;