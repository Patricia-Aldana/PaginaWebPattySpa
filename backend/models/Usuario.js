const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["cliente", "admin"],
      default: "cliente",
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExp: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usuario", UsuarioSchema);