const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({
  nombre: String,
  categoria: String,
  descripcion: String,
  precio: Number,
  stock: Number,
  sku: String,
  imagenUrl: String,
  activo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Producto", ProductoSchema);