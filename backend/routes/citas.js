const express = require("express");
const router = express.Router();
const citasController = require("../controllers/citasController");

// Crear cita
router.post("/agendamiento", citasController.create);

// Listar todas
router.get("/", citasController.listAll);

// Eliminar
router.delete("/:id", citasController.delete);

module.exports = router;
