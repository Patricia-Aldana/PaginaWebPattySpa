const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ProfesionalSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  especialidad: { type: String, required: true },
  email: { type: String },
  passwordHash: { type: String },
  fotoUrl: { type: String, default: "" },
  activo: { type: Boolean, default: true },
  creadoEn: { type: Date, default: Date.now }
});

ProfesionalSchema.methods.setPassword = async function(password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

ProfesionalSchema.methods.validatePassword = async function(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("Profesional", ProfesionalSchema);
