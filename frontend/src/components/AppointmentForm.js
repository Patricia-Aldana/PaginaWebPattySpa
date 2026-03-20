import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./Appointments.css";

const cleanText = (value) => String(value ?? "").trim();

const normalizeText = (value) =>
  cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const slugify = (value) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getBogotaTodayISO = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  return `${map.year}-${map.month}-${map.day}`;
};

const getBogotaNow = () =>
  new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));

const formatearFechaBonita = (fechaISO) => {
  if (!fechaISO) return "Sin seleccionar";
  const d = new Date(`${fechaISO}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fechaISO;

  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

function AppointmentForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuarioActual, setUsuarioActual] = useState(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [profesionalId, setProfesionalId] = useState("");

  const [profesionales, setProfesionales] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  const [ultimaCita, setUltimaCita] = useState(() => {
    try {
      const saved = localStorage.getItem("ultima_cita_pattyspa");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const hoyISO = useMemo(() => getBogotaTodayISO(), []);

  useEffect(() => {
    const data = localStorage.getItem("usuario");

    if (!data) {
      alert("Debes iniciar sesión para agendar una cita.");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(data);

      if (!user?._id && !user?.id && !user?.email) {
        throw new Error("Usuario inválido");
      }

      setUsuarioActual(user);
      setNombre(user?.nombre || "");
      setEmail(user?.email || "");
      setTelefono(user?.telefono || user?.celular || "");
    } catch (e) {
      console.error("No se pudo leer localStorage.usuario:", e);
      localStorage.removeItem("usuario");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const cargarCatalogos = async () => {
      try {
        setLoadingCatalogos(true);

        const [listaProfesionales, listaServicios] = await Promise.all([
          api.getProfesionales(true),
          api.getServicios(true),
        ]);

        if (!mounted) return;

        const profesionalesOrdenados = [...listaProfesionales].sort((a, b) =>
          String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
            sensitivity: "base",
          })
        );

        const serviciosOrdenados = [...listaServicios].sort((a, b) =>
          String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
            sensitivity: "base",
          })
        );

        setProfesionales(profesionalesOrdenados);
        setServicios(serviciosOrdenados);
      } catch (error) {
        console.error("Error cargando catálogos:", error);
        setMensaje(
          error.message || "No se pudieron cargar los profesionales o servicios."
        );
      } finally {
        if (mounted) {
          setLoadingCatalogos(false);
        }
      }
    };

    cargarCatalogos();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!profesionales.length || profesionalId) return;

    const query = new URLSearchParams(location.search).get("profesional");
    const q = slugify(query || "");

    if (!q) return;

    const encontrado = profesionales.find((p) => {
      const slug = slugify(p.nombre);
      const primerNombre = slug.split("-")[0];
      return slug === q || primerNombre === q;
    });

    if (encontrado) {
      setProfesionalId(String(encontrado._id));
    }
  }, [location.search, profesionales, profesionalId]);

  const servicioSeleccionado = servicios.find(
    (s) => String(s._id) === String(servicioId)
  );

  const profesionalSeleccionada = profesionales.find(
    (p) => String(p._id) === String(profesionalId)
  );

  const validarFechaHora = () => {
    if (!fecha || !hora) return true;

    if (hora < "08:00" || hora > "18:00") {
      setMensaje("Selecciona una hora entre 08:00 y 18:00.");
      return false;
    }

    if (fecha === hoyISO) {
      const ahora = getBogotaNow();
      const [hh, mm] = hora.split(":").map(Number);

      const seleccion = new Date(ahora);
      seleccion.setHours(hh, mm, 0, 0);

      if (seleccion <= ahora) {
        setMensaje("No puedes agendar una cita en una hora que ya pasó.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!usuarioActual?.email) {
      alert("Tu sesión no es válida. Inicia sesión nuevamente.");
      navigate("/login", { replace: true });
      return;
    }

    if (!nombre || !email || !fecha || !hora || !servicioId || !profesionalId) {
      setMensaje("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!validarFechaHora()) {
      return;
    }

    if (!servicioSeleccionado) {
      setMensaje("Servicio inválido.");
      return;
    }

    if (!profesionalSeleccionada) {
      setMensaje("Profesional inválida.");
      return;
    }

    if (profesionalSeleccionada.activo === false) {
      setMensaje("La profesional está inactiva y no puede agendarse.");
      return;
    }

    try {
      setLoading(true);

      const data = await api.crearCita({
        usuarioId: usuarioActual?._id || usuarioActual?.id || "",
        nombre,
        email: usuarioActual.email,
        telefono,
        fecha,
        hora,
        servicioId: servicioSeleccionado._id,
        servicioNombre: servicioSeleccionado.nombre,
        profesionalId: profesionalSeleccionada._id,
        profesionalNombre: profesionalSeleccionada.nombre,
        duracionMinutos: Number(servicioSeleccionado.duracionMinutos || 30),
      });

      const citaGuardada = {
        servicio: servicioSeleccionado.nombre,
        duracion: Number(servicioSeleccionado.duracionMinutos || 30),
        profesional: profesionalSeleccionada.nombre,
        fecha,
        hora,
      };

      setUltimaCita(citaGuardada);
      localStorage.setItem("ultima_cita_pattyspa", JSON.stringify(citaGuardada));

      if (data?.correoConfirmacionEnviado) {
        setMensaje("✅ Cita agendada con éxito. Revisa tu correo de confirmación.");
      } else {
        setMensaje(
          `✅ Cita agendada. ⚠️ No se pudo enviar el correo de confirmación${
            data?.mailError ? ` (${data.mailError})` : ""
          }.`
        );
      }

      setFecha("");
      setHora("");
      setServicioId("");
      setProfesionalId("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al agendar la cita.";

      setMensaje(msg);
    } finally {
      setLoading(false);
    }
  };

  const resumenServicio = servicioSeleccionado?.nombre || ultimaCita?.servicio || "Sin seleccionar";
  const resumenDuracion = servicioSeleccionado?.duracionMinutos
    ? `${servicioSeleccionado.duracionMinutos} min`
    : ultimaCita?.duracion
    ? `${ultimaCita.duracion} min`
    : "—";
  const resumenProfesional =
    profesionalSeleccionada?.nombre || ultimaCita?.profesional || "Sin seleccionar";
  const resumenFecha =
    (fecha && formatearFechaBonita(fecha)) ||
    (ultimaCita?.fecha ? formatearFechaBonita(ultimaCita.fecha) : "Sin seleccionar");
  const resumenHora = hora || ultimaCita?.hora || "Sin seleccionar";

  return (
    <div className="form-container">
      <div className="booking-header">
        <h2>Agendar Cita</h2>
        <p>
          Reserva tu servicio en Patty Spa de forma rápida, clara y segura.
        </p>
      </div>

      <div className="booking-layout">
        <form className="appointment-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Correo"
            value={email}
            readOnly
            required
            style={{ backgroundColor: "#f7f5fa" }}
          />

          <input
            type="tel"
            placeholder="Celular / WhatsApp"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <div className="grid-2">
            <input
              type="date"
              min={hoyISO}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />

            <input
              type="time"
              min="08:00"
              max="18:00"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
            />
          </div>

          <select
            value={servicioId}
            onChange={(e) => setServicioId(e.target.value)}
            required
            disabled={loadingCatalogos}
          >
            <option value="">
              {loadingCatalogos ? "Cargando servicios..." : "Selecciona servicio"}
            </option>

            {servicios.map((s) => (
              <option key={s._id} value={s._id}>
                {s.nombre} ({s.duracionMinutos || 30} min)
              </option>
            ))}
          </select>

          <select
            value={profesionalId}
            onChange={(e) => setProfesionalId(e.target.value)}
            required
            disabled={loadingCatalogos}
          >
            <option value="">
              {loadingCatalogos
                ? "Cargando profesionales..."
                : "Selecciona profesional"}
            </option>

            {profesionales.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre} ({p.especialidad})
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading || loadingCatalogos}>
            {loading ? "Agendando..." : "Agendar"}
          </button>
        </form>

        <aside className="booking-summary-card">
          <h3>Resumen de tu cita</h3>

          <div className="booking-summary-item">
            <span>Servicio</span>
            <strong>{resumenServicio}</strong>
          </div>

          <div className="booking-summary-item">
            <span>Duración</span>
            <strong>{resumenDuracion}</strong>
          </div>

          <div className="booking-summary-item">
            <span>Profesional</span>
            <strong>{resumenProfesional}</strong>
          </div>

          <div className="booking-summary-item">
            <span>Fecha</span>
            <strong>{resumenFecha}</strong>
          </div>

          <div className="booking-summary-item">
            <span>Hora</span>
            <strong>{resumenHora}</strong>
          </div>

          <div className="booking-rule-box">
            <h4>Importante</h4>
            <ul>
              <li>Horario disponible: 8:00 a. m. a 6:00 p. m.</li>
              <li>Las cancelaciones se permiten con 6 horas o más de anticipación.</li>
              <li>Recibirás confirmación por correo si el servicio de email está activo.</li>
            </ul>
          </div>
        </aside>
      </div>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}

export default AppointmentForm;