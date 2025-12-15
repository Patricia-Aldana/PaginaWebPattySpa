import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import "./Appointments.css";

function AppointmentForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [profesionalId, setProfesionalId] = useState("");
  const [profesionales, setProfesionales] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const hoyISO = new Date().toISOString().split("T")[0];

  const cargarProfesionales = async () => {
    setMensaje("");
    try {
      const data = await api.getProfesionales();
      setProfesionales(Array.isArray(data) ? data : []);
    } catch (e) {
      setMensaje("No se pudieron cargar los profesionales.");
    }
  };

  useEffect(() => {
    cargarProfesionales();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !email || !fecha || !hora || !servicio || !profesionalId) {
      setMensaje("Por favor completa todos los campos.");
      return;
    }

    if (hora < "08:00" || hora > "18:00") {
      setMensaje("Selecciona una hora entre 08:00 y 18:00.");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const data = await api.crearCita({
        nombre,
        email,
        fecha,
        hora,
        servicio,
        profesional: profesionalId,
      });

      setMensaje(data.message || "Cita agendada con éxito.");

      setNombre("");
      setEmail("");
      setFecha("");
      setHora("");
      setServicio("");
      setProfesionalId("");

    } catch (err) {
      console.error("ERROR AGENDANDO:", err);

      if (err.response) {
        if (err.response.status === 400) {
          const errorMsg =
            err.response.data?.error ||
            err.response.data?.message ||
            "La hora ya está ocupada para este profesional.";

          setMensaje(errorMsg);
          setLoading(false);
          return;
        }
      }

      setMensaje("Error al agendar: " + (err.message || "Error desconocido."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Agendar Cita</h2>

      <form className="appointment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        {/* ← AQUÍ CAMBIÉ: ahora es obligatorio */}
        <input
          type="email"
          placeholder="Correo (obligatorio)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
          required
        >
          <option value="">Selecciona servicio</option>
          <option value="manicure">Manicure (35 min)</option>
          <option value="pedicure">Pedicure (45 min)</option>
          <option value="tinte">Tinte (90 min)</option>
          <option value="corte">Corte (60 min)</option>
          <option value="facial">Facial (50 min)</option>
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={profesionalId}
            onChange={(e) => setProfesionalId(e.target.value)}
            required
            style={{ flex: 1 }}
          >
            <option value="">Selecciona profesional</option>
            {profesionales.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre} ({p.especialidad})
              </option>
            ))}
          </select>

          <button type="button" onClick={cargarProfesionales}>
            Reintentar
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Agendando..." : "Agendar"}
        </button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}

export default AppointmentForm;
