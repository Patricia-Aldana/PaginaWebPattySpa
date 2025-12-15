import React, { useEffect, useState } from "react";

function MisCitas() {
  const API = "http://localhost:5000";

  const [citas, setCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [emailFiltro, setEmailFiltro] = useState("");

  const cargarCitas = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/citas`);
      const data = await res.json();

      const citasLimpias = data.map((cita) => ({
        ...cita,
        inicio: cita.inicio ? cita.inicio : null,
        fin: cita.fin ? cita.fin : null,
      }));

      setCitas(citasLimpias);
      setCitasFiltradas(citasLimpias);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  useEffect(() => {
    if (!emailFiltro.trim()) {
      setCitasFiltradas(citas);
      return;
    }

    const filtradas = citas.filter((c) =>
      c.email?.toLowerCase().includes(emailFiltro.toLowerCase())
    );
    setCitasFiltradas(filtradas);
  }, [emailFiltro, citas]);

  const eliminarCita = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cita?")) return;

    try {
      await fetch(`${API}/api/citas/${id}`, {
        method: "DELETE",
      });

      cargarCitas();
    } catch (err) {
      console.error("Error eliminando cita:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Mis Citas</h2>
      <p>Puedes ver todas o filtrar por correo electrónico.</p>

      <div style={{ marginBottom: "15px", display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="Escribe tu correo para filtrar"
          value={emailFiltro}
          onChange={(e) => setEmailFiltro(e.target.value)}
          style={{ padding: 6, width: "250px" }}
        />

        <button
          onClick={() => {
            setEmailFiltro("");
            setCitasFiltradas(citas);
          }}
        >
          Limpiar
        </button>

        <button
          onClick={() => {
            setEmailFiltro("");
            cargarCitas();
          }}
        >
          Reiniciar lista
        </button>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Profesional</th>
              <th>Cliente</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Correo</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {citasFiltradas.map((cita) => (
              <tr key={cita._id}>
                <td>{cita.servicio}</td>

                <td>{cita.profesional?.nombre || "—"}</td>

                <td>{cita.nombre}</td>

                <td>
                  {cita.inicio
                    ? new Date(cita.inicio).toLocaleString()
                    : "Fecha inválida"}
                </td>

                <td>
                  {cita.fin
                    ? new Date(cita.fin).toLocaleString()
                    : "Fecha inválida"}
                </td>

                <td>{cita.email || "—"}</td>

                <td>
                  <button
                    onClick={() => eliminarCita(cita._id)}
                    style={{ background: "red", color: "white" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {citasFiltradas.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No hay citas para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MisCitas;
