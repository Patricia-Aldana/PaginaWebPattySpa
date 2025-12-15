require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();

// -------------------------
// 🔧 VARIABLES DE ENTORNO
// -------------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const allowedOriginsEnv =
  process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "*";

const allowedOrigins = allowedOriginsEnv
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// -------------------------
// 🌐 CORS
// -------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Middleware JSON
app.use(express.json());

// -------------------------
// 🗄 MONGO DB
// -------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error al conectar:", err));

// -------------------------
// 📜 LOG REQUESTS
// -------------------------
app.use((req, _res, next) => {
  console.log("------ NUEVA PETICIÓN ------");
  console.log(`${req.method} ${req.url}`);
  if (Object.keys(req.body || {}).length > 0) {
    console.log("BODY:", req.body);
  }
  console.log("-----------------------------");
  next();
});

// -------------------------
// ❤️ HEALTH CHECK
// -------------------------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, port: PORT });
});

// -------------------------
// 📌 SEED PROFESIONALES
// -------------------------
const Profesional = require("./models/Profesional");

async function seedProfesionalesOnce() {
  try {
    const count = await Profesional.countDocuments();

    if (count === 0) {
      await Profesional.insertMany([
        { nombre: "Patricia Aldana", especialidad: "Manicurista" },
        { nombre: "María del Pilar Gómez", especialidad: "Manicurista" },
        { nombre: "Yenny Cabi", especialidad: "Estilista" },
        { nombre: "Diana Escobar", especialidad: "Esteticista" },
      ]);

      console.log("🌱 Profesionales creados automáticamente");
    } else {
      console.log(`ℹ️ Profesionales existentes: ${count}`);
    }
  } catch (err) {
    console.error("❌ Error al crear profesionales:", err);
  }
}

mongoose.connection.once("open", seedProfesionalesOnce);

// -------------------------
// 📌 RUTAS
// -------------------------
app.use("/api/profesionales", require("./routes/profesionales"));
app.use("/api/citas", require("./routes/citas"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/servicios", require("./routes/servicios"));

// -------------------------
// ✉️ NODEMAILER
// -------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("❌ Error con nodemailer:", err);
  } else {
    console.log("📬 Servidor de correo listo");
  }
});

// -------------------------
// ⏲️ CRON JOB (6 HORAS ANTES)
// -------------------------
const Cita = require("./models/Cita");

cron.schedule("*/10 * * * *", async () => {
  console.log("⏳ Ejecutando CRON (cada 10 minutos)...");

  try {
    const ahora = new Date();
    const desde = new Date(ahora.getTime() + 5 * 60 * 60 * 1000);
    const hasta = new Date(ahora.getTime() + 6 * 60 * 60 * 1000);

    const citas = await Cita.find({
      inicio: {
        $gte: desde,
        $lte: hasta,
      },
      recordatorioEnviado: { $ne: true },
      email: { $ne: "" },
    });

    if (citas.length === 0) {
      console.log("📭 No hay citas para enviar recordatorio.");
      return;
    }

    for (const cita of citas) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: cita.email,
        subject: "Recordatorio de tu cita - Patty Spa",
        text: `Hola ${cita.nombre}, te recordamos tu cita hoy a las ${new Date(
          cita.inicio
        ).toLocaleTimeString()}. Te esperamos en Patty Spa 💅✨`,
      });

      cita.recordatorioEnviado = true;
      await cita.save();
    }

    console.log(`📨 Recordatorios enviados: ${citas.length}`);
  } catch (err) {
    console.error("❌ Error en CRON:", err);
  }
});

// -------------------------
// 🚀 SERVER
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend en http://localhost:${PORT}`);
  console.log(`🔎 Health check: http://localhost:${PORT}/api/health`);
});
