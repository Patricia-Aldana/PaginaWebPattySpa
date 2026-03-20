import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./Appointments.css";

const safeJSONParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizarCitas = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.citas)) return data.citas;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const esObjectId = (valor) =>
  /^[a-f\d]{24}$/i.test(String(valor || "").trim());

const esNombreReal = (valor) => {
  const txt = String(valor || "").trim();
  return !!txt && !esObjectId(txt);
};

const obtenerServicio = (cita) =>
  cita?.servicioId?.nombre ||
  (esNombreReal(cita?.servicioNombre) ? cita.servicioNombre : "") ||
  (esNombreReal(cita?.servicio) ? cita.servicio : "") ||
  "Sin servicio";

const obtenerProfesional = (cita) =>
  cita?.profesionalId?.nombre ||
  (esNombreReal(cita?.profesionalNombre) ? cita.profesionalNombre : "") ||
  (esNombreReal(cita?.profesional) ? cita.profesional : "") ||
  "Profesional no disponible";

const formatearFecha = (value) => {
  if (!value) return "Sin fecha";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleDateString("es-CO", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatearHora = (cita) => {
  if (cita?.hora) return cita.hora;

  if (!cita?.inicio) return "Sin hora";

  const d = new Date(cita.inicio);

  if (Number.isNaN(d.getTime())) return "Sin hora";

  return d.toLocaleTimeString("es-CO", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ordenarCitas = (lista = []) => {
  return [...lista].sort((a, b) => {
    const fechaA = new Date(a?.inicio || a?.createdAt || 0).getTime();
    const fechaB = new Date(b?.inicio || b?.createdAt || 0).getTime();
    return fechaB - fechaA;
  });
};

function AppointmentsList() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [cancelandoId, setCancelandoId] = useState("");

  useEffect(() => {
    const guardado = safeJSONParse(localStorage.getItem("usuario"), null);

    if (!guardado) {
      alert("Debes iniciar sesión para ver tus citas.");
      navigate("/login", { replace: true });
      return;
    }

    setUsuario(guardado);
  }, [navigate]);

  const cargarMisCitas = async () => {
    if (!usuario?._id && !usuario?.id && !usuario?.email) return;

    try {
      setLoading(true);
      setMensaje("");

      const data = await api.getMisCitas({
        usuarioId: usuario?._id || usuario?.id || "",
        email: usuario?.email || "",
      });

      const lista = normalizarCitas(data);
      setCitas(ordenarCitas(lista));
    } catch (error) {
      console.error("Error cargando mis citas:", error);
      setMensaje(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudieron cargar tus citas."
      );
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisCitas();
  }, [usuario]);

  const cancelarCita = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas cancelar esta cita? Recuerda que solo puede cancelarse con 6 horas o más de anticipación."
    );

    if (!confirmar) return;

    try {
      setCancelandoId(id);
      setMensaje("");

      const data = await api.cancelarCita(id);

      setMensaje(data?.message || "Cita cancelada correctamente.");
      await cargarMisCitas();
    } catch (error) {
      console.error("Error cancelando cita:", error);
      setMensaje(
        error?.response?.data?.message ||
          error?.message ||
          "No se pudo cancelar la cita."
      );
    } finally {
      setCancelandoId("");
    }
  };

  const stats = useMemo(() => {
    const total = citas.length;
    const activas = citas.filter(
      (c) => String(c?.estado || "").toLowerCase() !== "cancelada"
    ).length;
    const canceladas = citas.filter(
      (c) => String(c?.estado || "").toLowerCase() === "cancelada"
    ).length;

    return { total, activas, canceladas };
  }, [citas]);

  return (
    <div className="appointments-page">
      <div className="appointments-hero">
        <h1>Mis Citas</h1>
        <p>
          Aquí puedes consultar tus reservas, revisar la profesional asignada y
          cancelar a tiempo cuando lo necesites.
        </p>
      </div>

      <div className="appointments-summary">
        <div className="appointments-card">
          <h3>Total</h3>
          <p>{stats.total}</p>
        </div>

        <div className="appointments-card">
          <h3>Activas</h3>
          <p>{stats.activas}</p>
        </div>

        <div className="appointments-card">
          <h3>Canceladas</h3>
          <p>{stats.canceladas}</p>
        </div>
      </div>

      {mensaje && <div className="appointments-alert">{mensaje}</div>}

      {loading ? (
        <p className="appointments-empty">Cargando tus citas...</p>
      ) : citas.length === 0 ? (
        <div className="appointments-empty-box">
          <h2>No tienes citas registradas</h2>
          <p>Cuando hagas una reserva, te aparecerá aquí automáticamente.</p>
          <button
            className="appointments-primary-btn"
            onClick={() => navigate("/agendamiento")}
          >
            Agendar una cita
          </button>
        </div>
      ) : (
        <div className="appointments-grid">
          {citas.map((cita) => {
            const estado = String(cita?.estado || "reservada").toLowerCase();
            const cancelada = estado === "cancelada";

            return (
              <article className="appointment-item-card" key={cita._id}>
                <div className="appointment-item-top">
                  <h3>{obtenerServicio(cita)}</h3>
                  <span
                    className={
                      cancelada
                        ? "appointment-badge appointment-badge-cancelada"
                        : "appointment-badge appointment-badge-activa"
                    }
                  >
                    {cancelada ? "Cancelada" : "Reservada"}
                  </span>
                </div>

                <div className="appointment-item-body">
                  <p>
                    <strong>Profesional:</strong> {obtenerProfesional(cita)}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {formatearFecha(cita.inicio || cita.fecha)}
                  </p>
                  <p>
                    <strong>Hora:</strong> {formatearHora(cita)}
                  </p>
                  <p>
                    <strong>Correo:</strong> {cita?.email || usuario?.email || "—"}
                  </p>
                </div>

                <div className="appointment-item-actions">
                  {!cancelada && (
                    <button
                      className="appointments-danger-btn"
                      onClick={() => cancelarCita(cita._id)}
                      disabled={cancelandoId === cita._id}
                    >
                      {cancelandoId === cita._id
                        ? "Cancelando..."
                        : "Cancelar cita"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AppointmentsList;