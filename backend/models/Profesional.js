const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ProfesionalSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    especialidad: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      default: null,
    },

    passwordHash: {
      type: String,
      default: "",
    },

    fotoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    activo: {
      type: Boolean,
      default: true,
    },

    creadoEn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ProfesionalSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

ProfesionalSchema.methods.validatePassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("Profesional", ProfesionalSchema);