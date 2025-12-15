import React, { useEffect, useState } from "react";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [servicios, setServicios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [profesionales, setProfesionales] = useState([]);

  useEffect(() => {
    fetchServicios();
    fetchCitas();
    fetchProfesionales();
  }, []);

  // ============================
  // SERVICIOS
  // ============================
  const fetchServicios = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/servicios");
      const data = await res.json();
      setServicios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      setServicios([]);
    }
  };

  // 🔥 ACTIVAR / DESACTIVAR SERVICIO
  const toggleServicio = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/servicios/${id}/toggle`, {
        method: "PUT",
      });
      fetchServicios(); // refrescar la tabla
    } catch (error) {
      console.error("Error al cambiar estado del servicio:", error);
    }
  };

  // ============================
  // CITAS
  // ============================
  const fetchCitas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/citas");
      const data = await res.json();
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      setCitas([]);
    }
  };

  // ============================
  // PROFESIONALES
  // ============================
  const fetchProfesionales = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/profesionales");
      const data = await res.json();
      setProfesionales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener profesionales:", error);
      setProfesionales([]);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Panel Administrativo</h1>

      {/* RESUMEN */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total de citas</h3>
          <p>{citas.length}</p>
        </div>

        <div className="summary-card">
          <h3>Total de profesionales</h3>
          <p>{profesionales.length}</p>
        </div>

        <div className="summary-card">
          <h3>Total de servicios</h3>
          <p>{servicios.length}</p>
        </div>

        <div className="summary-card">
          <h3>Citas hoy</h3>
          <p>
            {
              citas.filter(
                (c) =>
                  new Date(c.inicio).toDateString() ===
                  new Date().toDateString()
              ).length
            }
          </p>
        </div>
      </div>

      {/* SERVICIOS */}
      <section className="admin-section">
        <h2>Servicios disponibles</h2>

        <table className="styled-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Duración</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {servicios.map((s) => (
              <tr key={s._id}>
                <td>{s.nombre}</td>
                <td>{s.duracionMinutos} min</td>
                <td>{s.descripcion}</td>
                <td>${s.precio}</td>
                <td>
                  {s.activo ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      Activo
                    </span>
                  ) : (
                    <span style={{ color: "red", fontWeight: "bold" }}>
                      Inactivo
                    </span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => toggleServicio(s._id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: s.activo ? "red" : "green",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    {s.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* CITAS */}
      <section className="admin-section">
        <h2>Citas agendadas</h2>

        <table className="styled-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Profesional</th>
              <th>Fecha</th>
              <th>Hora</th>
            </tr>
          </thead>

          <tbody>
            {citas.map((cita) => (
              <tr key={cita._id}>
                <td>{cita.nombre}</td>
                <td>{cita.servicio}</td>
                <td>{cita.profesional?.nombre || "Sin datos"}</td>
                <td>{new Date(cita.inicio).toLocaleDateString()}</td>
                <td>
                  {new Date(cita.inicio).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminPanel;
