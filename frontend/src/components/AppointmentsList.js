import React, { useEffect, useState } from "react";

function AppointmentsList() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarCitas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/citas");
      const data = await res.json();
      setCitas(data);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const eliminarCita = async (id) => {
    if (!window.confirm("¿Eliminar esta cita?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/citas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Error al eliminar la cita");
        return;
      }
      cargarCitas();
    } catch (error) {
      console.error("Error eliminando cita:", error);
    }
  };

  if (cargando) return <p style={{ padding: 20 }}>Cargando citas...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Mis Citas</h2>
      {citas.length === 0 ? (
        <p>No tienes citas registradas.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Cliente</th><th>Servicio</th><th>Profesional</th><th>Inicio</th><th>Fin</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {citas.map(c => (
              <tr key={c._id} style={{ borderTop: "1px solid #eee" }}>
                <td>{c.nombre}</td>
                <td>{c.servicio}</td>
                <td>{c.profesional?.nombre}</td>
                <td>{new Date(c.inicio).toLocaleString()}</td>
                <td>{new Date(c.fin).toLocaleString()}</td>
                <td><button onClick={()=>eliminarCita(c._id)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AppointmentsList;
