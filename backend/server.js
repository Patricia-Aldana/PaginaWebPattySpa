require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const path = require("path");

const Profesional = require("./models/Profesional");
const Servicio = require("./models/Servicio");
const Cita = require("./models/Cita");

const app = express();

/* -------------------------
   VARIABLES DE ENTORNO
------------------------- */
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Patty Spa";
const NODE_ENV = process.env.NODE_ENV || "development";

if (!MONGO_URI) {
  console.error("❌ Falta MONGO_URI en .env");
  process.exit(1);
}

/* -------------------------
   HELPERS
------------------------- */
const cleanText = (value) => String(value ?? "").trim();
const isObjectIdText = (value) => mongoose.isValidObjectId(cleanText(value));
const isRealNameText = (value) => {
  const txt = cleanText(value);
  return !!txt && !isObjectIdText(txt);
};

const firstObjectId = (...values) => {
  for (const value of values) {
    if (value && typeof value === "object" && value._id && isObjectIdText(value._id)) {
      return cleanText(value._id);
    }

    const txt = cleanText(value);
    if (isObjectIdText(txt)) return txt;
  }

  return "";
};

/* -------------------------
   CORS
------------------------- */
const normalizeOrigin = (value) =>
  String(value || "").trim().replace(/\/$/, "");

const allowedOriginsEnv =
  process.env.CORS_ORIGINS ||
  [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].join(",");

const allowedOrigins = allowedOriginsEnv
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const isLocalDevOrigin = (origin) => {
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
    origin
  );
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    if (NODE_ENV !== "production" && isLocalDevOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

console.log("✅ Orígenes permitidos CORS:", allowedOrigins);

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------------
   LOG DE PETICIONES
------------------------- */
app.use((req, _res, next) => {
  console.log("------ NUEVA PETICIÓN ------");
  console.log(`${req.method} ${req.originalUrl}`);

  if (Object.keys(req.body || {}).length > 0) {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = "********";
    if (safeBody.newPassword) safeBody.newPassword = "********";
    console.log("BODY:", safeBody);
  }

  console.log("----------------------------");
  next();
});

/* -------------------------
   RUTAS BÁSICAS
------------------------- */
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Backend funcionando correctamente",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    port: PORT,
    env: NODE_ENV,
  });
});

/* -------------------------
   NODEMAILER
------------------------- */
let transporter = null;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠️ Falta EMAIL_USER/EMAIL_PASS en .env. Correos desactivados.");
  app.locals.transporter = null;
  app.locals.EMAIL_USER = null;
  app.locals.MAIL_FROM = null;
} else {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  transporter.verify((err, success) => {
    if (err) {
      console.error("❌ Error con nodemailer:", err);
    } else {
      console.log("📬 Servidor de correo listo:", success);
    }
  });

  app.locals.transporter = transporter;
  app.locals.EMAIL_USER = EMAIL_USER;
  app.locals.MAIL_FROM = `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`;
}

/* -------------------------
   TEST DE CORREO SOLO EN DESARROLLO
------------------------- */
if (NODE_ENV !== "production") {
  app.get("/api/test-mail", async (req, res) => {
    try {
      const to = cleanText(req.query.to || EMAIL_USER);

      if (!app.locals.transporter || !app.locals.MAIL_FROM) {
        return res.status(500).json({
          ok: false,
          message: "Mailer no configurado",
        });
      }

      if (!to) {
        return res.status(400).json({
          ok: false,
          message: "Debes enviar ?to=correo@dominio.com",
        });
      }

      const info = await app.locals.transporter.sendMail({
        from: app.locals.MAIL_FROM,
        to,
        subject: "Prueba de correo - Patty Spa",
        text: "Este es un correo de prueba desde Patty Spa.",
        html: `
          <div style="font-family:Arial,sans-serif">
            <h2>Prueba de correo - Patty Spa</h2>
            <p>Si recibiste este correo, el sistema está funcionando.</p>
          </div>
        `,
      });

      console.log("📨 Test mail:", {
        to,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      });

      return res.json({
        ok: true,
        message: "Correo de prueba enviado",
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      });
    } catch (error) {
      console.error("❌ Error en test-mail:", error);

      return res.status(500).json({
        ok: false,
        message: error.message || "Error enviando correo de prueba",
      });
    }
  });
}

/* -------------------------
   RUTAS API
------------------------- */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profesionales", require("./routes/profesionales"));
app.use("/api/citas", require("./routes/citas"));
app.use("/api/servicios", require("./routes/servicios"));
app.use("/api/productos", require("./routes/productos"));

/* -------------------------
   CRON RECORDATORIOS
   Se envían entre 6 y 7 horas antes
------------------------- */
cron.schedule("*/10 * * * *", async () => {
  if (!transporter) return;

  try {
    const ahora = new Date();
    const desde = new Date(ahora.getTime() + 6 * 60 * 60 * 1000);
    const hasta = new Date(ahora.getTime() + 7 * 60 * 60 * 1000);

    const citas = await Cita.find({
      inicio: { $gte: desde, $lte: hasta },
      recordatorioEnviado: { $ne: true },
      email: { $ne: "" },
      estado: { $ne: "cancelada" },
    }).lean();

    for (const cita of citas) {
      try {
        const fechaHora = new Date(cita.inicio).toLocaleString("es-CO", {
          timeZone: "America/Bogota",
        });

        await transporter.sendMail({
          from: app.locals.MAIL_FROM,
          to: cita.email,
          subject: "Recordatorio de tu cita - Patty Spa",
          text: `Hola ${cita.nombre}, te recordamos tu cita para ${fechaHora}. Recuerda que solo puedes cancelarla con 6 horas o más de anticipación.`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
              <h2 style="color:#7b2cbf;">Recordatorio de tu cita</h2>
              <p>Hola <strong>${cita.nombre}</strong>,</p>
              <p>Te recordamos tu cita para el día <strong>${fechaHora}</strong>.</p>
              <p>Recuerda que solo puedes cancelarla con <strong>6 horas o más de anticipación</strong>.</p>
              <p>Te esperamos en <strong>Patty Spa</strong> 💅✨</p>
            </div>
          `,
        });

        await Cita.updateOne(
          { _id: cita._id },
          { $set: { recordatorioEnviado: true } }
        );
      } catch (mailErr) {
        console.error(`❌ Error enviando recordatorio a ${cita.email}:`, mailErr);
      }
    }
  } catch (err) {
    console.error("❌ Error en CRON:", err);
  }
});

/* -------------------------
   SEEDS
------------------------- */
async function seedProfesionalesOnce() {
  try {
    const count = await Profesional.countDocuments();

    if (count === 0) {
      await Profesional.insertMany([
        {
          nombre: "Patricia Aldana",
          especialidad: "Manicurista",
          activo: true,
          fotoUrl: "",
        },
        {
          nombre: "María del Pilar Gómez",
          especialidad: "Colorista",
          activo: true,
          fotoUrl: "",
        },
        {
          nombre: "Yenny Cabi",
          especialidad: "Esteticista",
          activo: true,
          fotoUrl: "",
        },
        {
          nombre: "Diana Escobar",
          especialidad: "Manicurista",
          activo: true,
          fotoUrl: "",
        },
      ]);

      console.log("🌱 Profesionales creados automáticamente");
    } else {
      console.log(`ℹ️ Profesionales existentes: ${count}`);
    }
  } catch (err) {
    console.error("❌ Error al crear profesionales:", err);
  }
}

async function seedServiciosOnce() {
  try {
    const count = await Servicio.countDocuments();

    if (count === 0) {
      await Servicio.insertMany([
        {
          nombre: "Corte de Cabello Hombre",
          categoria: "Cabello",
          duracionMinutos: 30,
          descripcion: "Incluye lavado",
          precio: 12000,
          activo: true,
        },
        {
          nombre: "Corte de Cabello Mujer",
          categoria: "Cabello",
          duracionMinutos: 45,
          descripcion: "Asesoría de estilo",
          precio: 25000,
          activo: true,
        },
        {
          nombre: "Peinado",
          categoria: "Cabello",
          duracionMinutos: 40,
          descripcion: "Eventos y casual",
          precio: 20000,
          activo: true,
        },
        {
          nombre: "Tintura completa",
          categoria: "Color",
          duracionMinutos: 90,
          descripcion: "Color uniforme",
          precio: 60000,
          activo: true,
        },
        {
          nombre: "Mechas / Balayage",
          categoria: "Color",
          duracionMinutos: 120,
          descripcion: "Técnicas de color",
          precio: 120000,
          activo: true,
        },
        {
          nombre: "Manicura",
          categoria: "Uñas",
          duracionMinutos: 45,
          descripcion: "Servicio completo con esmaltado",
          precio: 18000,
          activo: true,
        },
        {
          nombre: "Pedicura",
          categoria: "Uñas",
          duracionMinutos: 50,
          descripcion: "Limpieza profunda y esmaltado",
          precio: 20000,
          activo: true,
        },
        {
          nombre: "Uñas Acrílicas",
          categoria: "Uñas",
          duracionMinutos: 90,
          descripcion: "Esculturales",
          precio: 80000,
          activo: true,
        },
        {
          nombre: "Masaje Relajante",
          categoria: "Spa",
          duracionMinutos: 60,
          descripcion: "Masaje corporal completo",
          precio: 40000,
          activo: true,
        },
        {
          nombre: "Masaje Descontracturante",
          categoria: "Spa",
          duracionMinutos: 60,
          descripcion: "Focalizado espalda/cuello",
          precio: 50000,
          activo: true,
        },
        {
          nombre: "Depilación de Cejas",
          categoria: "Depilación",
          duracionMinutos: 15,
          descripcion: "Moldeado con cera o pinza",
          precio: 8000,
          activo: true,
        },
        {
          nombre: "Depilación de Piernas",
          categoria: "Depilación",
          duracionMinutos: 40,
          descripcion: "Cera tibia",
          precio: 35000,
          activo: true,
        },
        {
          nombre: "Limpieza Facial",
          categoria: "Facial",
          duracionMinutos: 50,
          descripcion: "Limpieza profunda",
          precio: 45000,
          activo: true,
        },
        {
          nombre: "Microblading de Cejas",
          categoria: "Facial",
          duracionMinutos: 120,
          descripcion: "Diseño y pigmentación",
          precio: 180000,
          activo: true,
        },
      ]);

      console.log("🌱 Servicios creados automáticamente");
    } else {
      console.log(`ℹ️ Servicios existentes: ${count}`);
    }
  } catch (err) {
    console.error("❌ Error al crear servicios:", err);
  }
}

/* -------------------------
   REPARAR CITAS ANTIGUAS
------------------------- */
async function repairOldCitasDataOnce() {
  try {
    const citas = await Cita.find({}).lean();

    if (!citas.length) {
      console.log("ℹ️ No hay citas para reparar");
      return;
    }

    const profesionalIds = new Set();
    const servicioIds = new Set();

    for (const cita of citas) {
      const profId = firstObjectId(
        cita.profesionalId,
        cita.profesionalNombre,
        cita.profesional
      );

      const servId = firstObjectId(
        cita.servicioId,
        cita.servicioNombre,
        cita.servicio
      );

      if (profId) profesionalIds.add(profId);
      if (servId) servicioIds.add(servId);
    }

    const [profesionales, servicios] = await Promise.all([
      profesionalIds.size
        ? Profesional.find({ _id: { $in: Array.from(profesionalIds) } })
            .select("nombre")
            .lean()
        : [],
      servicioIds.size
        ? Servicio.find({ _id: { $in: Array.from(servicioIds) } })
            .select("nombre")
            .lean()
        : [],
    ]);

    const profMap = new Map(profesionales.map((p) => [String(p._id), p]));
    const servMap = new Map(servicios.map((s) => [String(s._id), s]));

    let reparadas = 0;

    for (const cita of citas) {
      const update = {};

      const profId = firstObjectId(
        cita.profesionalId,
        cita.profesionalNombre,
        cita.profesional
      );

      const servId = firstObjectId(
        cita.servicioId,
        cita.servicioNombre,
        cita.servicio
      );

      const profDoc = profMap.get(profId);
      const servDoc = servMap.get(servId);

      if (!cita.profesionalId && profId) {
        update.profesionalId = profId;
      }

      if (profDoc) {
        if (!isRealNameText(cita.profesionalNombre)) {
          update.profesionalNombre = profDoc.nombre;
        }

        if (!isRealNameText(cita.profesional)) {
          update.profesional = profDoc.nombre;
        }
      }

      if (!cita.servicioId && servId) {
        update.servicioId = servId;
      }

      if (servDoc) {
        if (!isRealNameText(cita.servicioNombre)) {
          update.servicioNombre = servDoc.nombre;
        }

        if (!isRealNameText(cita.servicio)) {
          update.servicio = servDoc.nombre;
        }
      }

      if (Object.keys(update).length > 0) {
        await Cita.updateOne({ _id: cita._id }, { $set: update });
        reparadas++;
      }
    }

    console.log(`🛠 Citas antiguas reparadas: ${reparadas}`);
  } catch (error) {
    console.error("❌ Error reparando citas antiguas:", error);
  }
}

/* -------------------------
   404 JSON
------------------------- */
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

/* -------------------------
   MANEJO GLOBAL DE ERRORES
------------------------- */
app.use((err, _req, res, _next) => {
  console.error("❌ Error global:", err);

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || "Error interno del servidor",
  });
});

/* -------------------------
   INICIAR SERVIDOR
------------------------- */
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    await seedProfesionalesOnce();
    await seedServiciosOnce();
    await repairOldCitasDataOnce();

    app.listen(PORT, () => {
      console.log(`🚀 Backend en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar servidor:", err);
    process.exit(1);
  }
}

startServer();