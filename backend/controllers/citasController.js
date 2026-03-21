const mongoose = require("mongoose");
const Cita = require("../models/Cita");
const Profesional = require("../models/Profesional");
const Servicio = require("../models/Servicio");
const { sendBrevoEmail } = require("../utils/brevoMailer");

const LIMITE_CANCELACION_HORAS = 6;

const cleanText = (value) => String(value ?? "").trim();
const cleanEmail = (value) => cleanText(value).toLowerCase();
const isObjectIdText = (value) => mongoose.isValidObjectId(cleanText(value));

const isRealNameText = (value) => {
  const txt = cleanText(value);
  return !!txt && !isObjectIdText(txt);
};

const firstObjectId = (...values) => {
  for (const value of values) {
    if (
      value &&
      typeof value === "object" &&
      value._id &&
      isObjectIdText(value._id)
    ) {
      return cleanText(value._id);
    }

    const txt = cleanText(value);
    if (isObjectIdText(txt)) return txt;
  }

  return "";
};

const firstRealName = (...values) => {
  for (const value of values) {
    if (value && typeof value === "object" && isRealNameText(value.nombre)) {
      return cleanText(value.nombre);
    }

    const txt = cleanText(value);
    if (isRealNameText(txt)) return txt;
  }

  return "";
};

const escapeRegex = (value) =>
  cleanText(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildBogotaDate = (fecha, hora = "00:00") => {
  const fechaTxt = cleanText(fecha);
  const horaTxt = cleanText(hora || "00:00");

  if (!fechaTxt) return null;

  const [year, month, day] = fechaTxt.split("-").map(Number);
  const [hours, minutes] = horaTxt.split(":").map(Number);

  if (!year || !month || !day) return null;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return new Date(Date.UTC(year, month - 1, day, hours + 5, minutes, 0));
};

const buildStartDate = ({ inicio, fecha, hora }) => {
  const direct = toDate(inicio);
  if (direct) return direct;

  return buildBogotaDate(fecha, hora);
};

const addMinutes = (date, minutes) =>
  new Date(date.getTime() + minutes * 60 * 1000);

const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return "Fecha no disponible";

  return date.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const sendConfirmationEmail = async (cita) => {
  const servicio =
    firstRealName(cita.servicioNombre, cita.servicio) || "Servicio";

  const profesional =
    firstRealName(cita.profesionalNombre, cita.profesional) || "Profesional";

  const fechaHora = formatDateTime(cita.inicio);

  return sendBrevoEmail({
    to: cita.email,
    toName: cita.nombre,
    subject: "Confirmación de tu cita - Patty Spa",
    textContent: `Hola ${cita.nombre}.

Tu cita fue reservada correctamente en Patty Spa.

Servicio: ${servicio}
Profesional: ${profesional}
Fecha y hora: ${fechaHora}

Recuerda que solo puedes cancelar tu cita con ${LIMITE_CANCELACION_HORAS} horas o más de anticipación.

¡Te esperamos!`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
        <h2 style="color:#7b2cbf;">Confirmación de tu cita</h2>
        <p>Hola <strong>${cita.nombre}</strong>,</p>
        <p>Tu cita fue reservada correctamente en <strong>Patty Spa</strong>.</p>

        <table style="border-collapse:collapse;margin-top:12px">
          <tr>
            <td style="padding:6px 12px 6px 0;"><strong>Servicio:</strong></td>
            <td style="padding:6px 0;">${servicio}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px 6px 0;"><strong>Profesional:</strong></td>
            <td style="padding:6px 0;">${profesional}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px 6px 0;"><strong>Fecha y hora:</strong></td>
            <td style="padding:6px 0;">${fechaHora}</td>
          </tr>
        </table>

        <p style="margin-top:16px;">
          Recuerda que solo puedes cancelar tu cita con
          <strong>${LIMITE_CANCELACION_HORAS} horas o más de anticipación</strong>.
        </p>

        <p>Gracias por confiar en Patty Spa 💅✨</p>
      </div>
    `,
  });
};

const sendCancellationEmail = async (cita) => {
  const servicio =
    firstRealName(cita.servicioNombre, cita.servicio) || "Servicio";

  const profesional =
    firstRealName(cita.profesionalNombre, cita.profesional) || "Profesional";

  const fechaHora = formatDateTime(cita.inicio);

  return sendBrevoEmail({
    to: cita.email,
    toName: cita.nombre,
    subject: "Cancelación de tu cita - Patty Spa",
    textContent: `Hola ${cita.nombre}.

Tu cita fue cancelada correctamente.

Servicio: ${servicio}
Profesional: ${profesional}
Fecha y hora original: ${fechaHora}`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
        <h2 style="color:#b02a37;">Cancelación de tu cita</h2>
        <p>Hola <strong>${cita.nombre}</strong>,</p>
        <p>Tu cita fue cancelada correctamente.</p>

        <table style="border-collapse:collapse;margin-top:12px">
          <tr>
            <td style="padding:6px 12px 6px 0;"><strong>Servicio:</strong></td>
            <td style="padding:6px 0;">${servicio}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px 6px 0;"><strong>Profesional:</strong></td>
            <td style="padding:6px 0;">${profesional}</td>
          </tr>
          <tr>
            <td style="padding:6px 12px 6px 0;"><strong>Fecha y hora original:</strong></td>
            <td style="padding:6px 0;">${fechaHora}</td>
          </tr>
        </table>
      </div>
    `,
  });
};

const normalizeCitas = async (citas = []) => {
  const profesionalIds = new Set();
  const servicioIds = new Set();

  for (const cita of citas) {
    const profesionalId = firstObjectId(
      cita.profesionalId,
      cita.profesionalNombre,
      cita.profesional
    );

    const servicioId = firstObjectId(
      cita.servicioId,
      cita.servicioNombre,
      cita.servicio
    );

    if (profesionalId) profesionalIds.add(profesionalId);
    if (servicioId) servicioIds.add(servicioId);
  }

  const [profesionales, servicios] = await Promise.all([
    profesionalIds.size
      ? Profesional.find({ _id: { $in: Array.from(profesionalIds) } })
          .select("nombre especialidad activo")
          .lean()
      : [],
    servicioIds.size
      ? Servicio.find({ _id: { $in: Array.from(servicioIds) } })
          .select("nombre precio duracionMinutos activo")
          .lean()
      : [],
  ]);

  const profMap = new Map(profesionales.map((p) => [String(p._id), p]));
  const servMap = new Map(servicios.map((s) => [String(s._id), s]));

  return citas.map((cita) => {
    const profesionalId = firstObjectId(
      cita.profesionalId,
      cita.profesionalNombre,
      cita.profesional
    );

    const servicioId = firstObjectId(
      cita.servicioId,
      cita.servicioNombre,
      cita.servicio
    );

    const profesionalDoc = profMap.get(profesionalId);
    const servicioDoc = servMap.get(servicioId);

    const profesionalNombreFinal =
      firstRealName(
        cita.profesionalNombre,
        cita.profesional,
        profesionalDoc?.nombre
      ) || "";

    const servicioNombreFinal =
      firstRealName(
        cita.servicioNombre,
        cita.servicio,
        servicioDoc?.nombre
      ) || "";

    return {
      ...cita,
      profesionalId: profesionalId || null,
      profesionalNombre: profesionalNombreFinal,
      profesional: profesionalNombreFinal,
      servicioId: servicioId || null,
      servicioNombre: servicioNombreFinal,
      servicio: servicioNombreFinal,
    };
  });
};

const buildFilters = (query = {}) => {
  const usuarioId = cleanText(
    query.usuarioId || query.userId || query.clienteId || query.id
  );
  const email = cleanEmail(query.email || query.correo);

  if (usuarioId && isObjectIdText(usuarioId) && email) {
    return {
      $or: [{ usuarioId }, { email }],
    };
  }

  if (usuarioId && isObjectIdText(usuarioId)) {
    return { usuarioId };
  }

  if (email) {
    return { email };
  }

  return {};
};

const create = async (req, res) => {
  try {
    const nombre = cleanText(req.body.nombre);
    const email = cleanEmail(req.body.email);
    const telefono = cleanText(req.body.telefono || req.body.celular);
    const notas = cleanText(req.body.notas || req.body.observaciones);

    const usuarioId = cleanText(
      req.body.usuarioId ||
        req.body.userId ||
        req.body.clienteId ||
        req.body.id
    );

    const servicioId = firstObjectId(req.body.servicioId, req.body.servicio);

    const servicioTexto = firstRealName(
      req.body.servicioNombre,
      req.body.nombreServicio,
      req.body.servicio
    );

    const profesionalId = firstObjectId(
      req.body.profesionalId,
      req.body.profesional
    );

    const profesionalTexto = firstRealName(
      req.body.profesionalNombre,
      req.body.nombreProfesional,
      req.body.profesional
    );

    const inicio = buildStartDate(req.body);

    if (
      !nombre ||
      !email ||
      !inicio ||
      (!servicioId && !servicioTexto) ||
      (!profesionalId && !profesionalTexto)
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Nombre, correo, fecha/hora, servicio y profesional son obligatorios",
      });
    }

    let servicioDoc = null;
    let profesionalDoc = null;

    if (servicioId) {
      servicioDoc = await Servicio.findById(servicioId);
    } else if (servicioTexto) {
      servicioDoc = await Servicio.findOne({
        nombre: { $regex: new RegExp(`^${escapeRegex(servicioTexto)}$`, "i") },
      });
    }

    if (!servicioDoc) {
      return res.status(404).json({
        ok: false,
        message: "El servicio seleccionado no existe",
      });
    }

    if (servicioDoc.activo === false) {
      return res.status(400).json({
        ok: false,
        message: "El servicio seleccionado está inactivo",
      });
    }

    if (profesionalId) {
      profesionalDoc = await Profesional.findById(profesionalId);
    } else if (profesionalTexto) {
      profesionalDoc = await Profesional.findOne({
        nombre: {
          $regex: new RegExp(`^${escapeRegex(profesionalTexto)}$`, "i"),
        },
      });
    }

    if (!profesionalDoc) {
      return res.status(404).json({
        ok: false,
        message: "La profesional seleccionada no existe",
      });
    }

    if (profesionalDoc.activo === false) {
      return res.status(400).json({
        ok: false,
        message: "La profesional seleccionada está inactiva",
      });
    }

    const nombreServicioFinal = servicioDoc.nombre;
    const nombreProfesionalFinal = profesionalDoc.nombre;

    const duracionNum = Number(
      req.body.duracionMinutos ||
        req.body.duracion ||
        servicioDoc?.duracionMinutos ||
        30
    );

    const duracionMinutos =
      Number.isFinite(duracionNum) && duracionNum > 0 ? duracionNum : 30;

    const fin = toDate(req.body.fin) || addMinutes(inicio, duracionMinutos);

    const profIdStr = String(profesionalDoc._id);

    const choque = await Cita.findOne({
      estado: { $ne: "cancelada" },
      inicio: { $lt: fin },
      $or: [
        { fin: { $gt: inicio } },
        { fin: { $exists: false } },
        { fin: null },
      ],
      $and: [
        {
          $or: [
            { profesionalId: profesionalDoc._id },
            { profesionalNombre: nombreProfesionalFinal },
            { profesional: nombreProfesionalFinal },
            { profesionalNombre: profIdStr },
            { profesional: profIdStr },
          ],
        },
      ],
    });

    if (choque) {
      return res.status(409).json({
        ok: false,
        message: "Ese profesional ya tiene una cita en ese horario",
      });
    }

    const payload = {
      nombre,
      email,
      telefono,
      celular: telefono,
      inicio,
      fin,
      fecha: cleanText(req.body.fecha),
      hora: cleanText(req.body.hora),
      duracionMinutos,
      estado: "reservada",
      notas,
      observaciones: notas,
      recordatorioEnviado: false,
      servicioId: servicioDoc._id,
      servicioNombre: nombreServicioFinal,
      servicio: nombreServicioFinal,
      profesionalId: profesionalDoc._id,
      profesionalNombre: nombreProfesionalFinal,
      profesional: nombreProfesionalFinal,
    };

    if (usuarioId && isObjectIdText(usuarioId)) {
      payload.usuarioId = usuarioId;
    }

    const nuevaCita = await Cita.create(payload);

    const [citaNormalizada] = await normalizeCitas([
      await Cita.findById(nuevaCita._id).lean(),
    ]);

    const mailResult = await sendConfirmationEmail(citaNormalizada);

    return res.status(201).json({
      ok: true,
      message: mailResult.sent
        ? "Cita creada y correo de confirmación enviado"
        : "Cita creada, pero no se pudo enviar el correo de confirmación",
      correoConfirmacionEnviado: !!mailResult.sent,
      mailError: mailResult.sent ? null : mailResult.reason,
      cita: citaNormalizada,
    });
  } catch (error) {
    console.error("❌ Error creando cita:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error al crear la cita",
    });
  }
};

const listAll = async (_req, res) => {
  try {
    const citasRaw = await Cita.find({})
      .sort({ inicio: -1, createdAt: -1 })
      .lean();

    const citas = await normalizeCitas(citasRaw);

    return res.status(200).json({
      ok: true,
      citas,
    });
  } catch (error) {
    console.error("❌ Error listando citas:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error al listar citas",
    });
  }
};

const listMine = async (req, res) => {
  try {
    const filtro = buildFilters(req.query);

    if (!Object.keys(filtro).length) {
      return res.status(400).json({
        ok: false,
        message: "Debes enviar usuarioId o email para consultar tus citas",
      });
    }

    const citasRaw = await Cita.find(filtro)
      .sort({ inicio: -1, createdAt: -1 })
      .lean();

    const citas = await normalizeCitas(citasRaw);

    return res.status(200).json({
      ok: true,
      citas,
    });
  } catch (error) {
    console.error("❌ Error listando mis citas:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error al listar mis citas",
    });
  }
};

const deleteCita = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isObjectIdText(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID de cita inválido",
      });
    }

    const cita = await Cita.findByIdAndDelete(id);

    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Cita eliminada correctamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando cita:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error al eliminar la cita",
    });
  }
};

const cancelar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isObjectIdText(id)) {
      return res.status(400).json({
        ok: false,
        message: "ID de cita inválido",
      });
    }

    const cita = await Cita.findById(id);

    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada",
      });
    }

    const inicio = toDate(cita.inicio);

    if (!inicio) {
      return res.status(400).json({
        ok: false,
        message: "La cita no tiene fecha válida para cancelar",
      });
    }

    const horasFaltantes = (inicio.getTime() - Date.now()) / (1000 * 60 * 60);

    if (horasFaltantes < LIMITE_CANCELACION_HORAS) {
      return res.status(400).json({
        ok: false,
        message: `Solo puedes cancelar una cita con ${LIMITE_CANCELACION_HORAS} horas o más de anticipación`,
      });
    }

    cita.estado = "cancelada";
    await cita.save();

    const [citaNormalizada] = await normalizeCitas([cita.toObject()]);

    await sendCancellationEmail(citaNormalizada);

    return res.status(200).json({
      ok: true,
      message: "Cita cancelada correctamente",
      cita: citaNormalizada,
    });
  } catch (error) {
    console.error("❌ Error cancelando cita:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error al cancelar la cita",
    });
  }
};

module.exports = {
  create,
  listAll,
  listMine,
  deleteCita,
  cancelar,
};