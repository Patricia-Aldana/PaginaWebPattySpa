const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");

// Obtener todos los productos activos (para la tienda)
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo productos" });
  }
});

// Obtener TODOS los productos (para panel administrativo)
router.get("/admin", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo productos" });
  }
});

// Crear producto (opcional)
router.post("/", async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    res.json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: "Error creando producto" });
  }
});

// ⭐ Activar / Desactivar producto
router.put("/:id/toggle", async (req, res) => {
  try {

    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    producto.activo = !producto.activo;

    await producto.save();

    res.json(producto);

  } catch (error) {
    res.status(500).json({ error: "Error actualizando producto" });
    
  }
});
// ⭐ Actualizar precio de producto
router.put("/:id", async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { precio: req.body.precio },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error actualizando precio del producto" });
  }
});
module.exports = router;