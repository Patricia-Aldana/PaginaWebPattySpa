const jwt = require("jsonwebtoken");
const Profesional = require("../models/Profesional");
const JWT_SECRET = process.env.JWT_SECRET || "secretdev";

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "No autorizado" });
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const prof = await Profesional.findById(payload.id);
    if (!prof) return res.status(401).json({ message: "Profesional no encontrado" });
    req.profesional = prof;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};
