import Producto from "../models/Producto.js";

export const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
};

export const crearProducto = async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear producto" });
  }
};