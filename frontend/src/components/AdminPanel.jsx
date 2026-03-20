import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const safeJSONParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const leerRespuesta = async (res) => {
  const texto = await res.text();

  try {
    return texto ? JSON.parse(texto) : {};
  } catch {
    return {
      message: texto || "Respuesta inválida del servidor",
    };
  }
};

const normalizarNombre = (nombre) =>
  (nombre || "").trim().toLowerCase().replace(/\s+/g, " ");

const escogerMejor = (a, b) => {
  if (!!a.activo !== !!b.activo) return a.activo ? a : b;

  const ida = String(a._id || "");
  const idb = String(b._id || "");

  return ida > idb ? a : b;
};

const deduplicarServicios = (lista) => {
  const map = new Map();

  for (const s of lista) {
    const key = normalizarNombre(s.nombre);
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, s);
    } else {
      map.set(key, escogerMejor(map.get(key), s));
    }
  }

  return Array.from(map.values()).sort((x, y) =>
    (x.nombre || "").localeCompare(y.nombre || "", "es", {
      sensitivity: "base",
    })
  );
};

const extraerArray = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const esObjectId = (valor) =>
  /^[a-f\d]{24}$/i.test(String(valor || "").trim());

const esNombreReal = (valor) => {
  const txt = String(valor || "").trim();
  return !!txt && !esObjectId(txt);
};

const ordenarCitas = (lista = []) => {
  return [...lista].sort((a, b) => {
    const fechaA = new Date(a?.inicio || a?.createdAt || 0).getTime();
    const fechaB = new Date(b?.inicio || b?.createdAt || 0).getTime();
    return fechaB - fechaA;
  });
};

const obtenerCliente = (cita) =>
  cita?.usuarioId?.nombre || cita?.nombre || "Sin nombre";

const obtenerCorreo = (cita) =>
  cita?.usuarioId?.email || cita?.email || "Sin correo";

const obtenerTelefono = (cita) =>
  cita?.telefono || cita?.celular || cita?.whatsapp || "";

const obtenerServicio = (cita) =>
  cita?.servicioId?.nombre ||
  (esNombreReal(cita?.servicioNombre) ? cita.servicioNombre : "") ||
  (esNombreReal(cita?.servicio) ? cita.servicio : "") ||
  "Sin servicio";

const obtenerProfesional = (cita, mapaProfesionales) => {
  const directo =
    cita?.profesionalId?.nombre ||
    (esNombreReal(cita?.profesionalNombre) ? cita.profesionalNombre : "") ||
    (esNombreReal(cita?.profesional) ? cita.profesional : "");

  if (directo) return directo;

  const posibleId = String(
    cita?.profesionalId?._id ||
      cita?.profesionalId ||
      cita?.profesionalNombre ||
      cita?.profesional ||
      ""
  ).trim();

  return mapaProfesionales.get(posibleId) || "Profesional no disponible";
};

const obtenerEstado = (cita) => {
  const estado = String(cita?.estado || "").trim().toLowerCase();

  if (!estado) return "Reservada";

  return estado.charAt(0).toUpperCase() + estado.slice(1);
};

const claseEstadoCita = (cita) => {
  const estado = String(cita?.estado || "").trim().toLowerCase();

  if (estado === "cancelada") return "badge badge-off";
  return "badge badge-ok";
};

const formatearFecha = (value) => {
  if (!value) return "Sin fecha";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return String(value);
  }

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

  if (Number.isNaN(d.getTime())) {
    return "Sin hora";
  }

  return d.toLocaleTimeString("es-CO", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const AdminPanel = () => {
  const navigate = useNavigate();

  const [serviciosRaw, setServiciosRaw] = useState([]);
  const [citas, setCitas] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [errorCitas, setErrorCitas] = useState("");

  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [editandoProductoId, setEditandoProductoId] = useState(null);
  const [precioProductoEditado, setPrecioProductoEditado] = useState("");
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [errorProducto, setErrorProducto] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [precioEditado, setPrecioEditado] = useState("");
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState("");

  const formatoCOP = useMemo(() => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  }, []);

  const mapaProfesionales = useMemo(() => {
    const map = new Map();
    profesionales.forEach((p) => {
      map.set(String(p._id), p.nombre);
    });
    return map;
  }, [profesionales]);

  const mostrarPrecio = (valor) => {
    if (typeof valor === "number") return formatoCOP.format(valor);

    if (typeof valor === "string") {
      const digits = valor.replace(/[^\d]/g, "");
      const num = Number(digits);
      if (!Number.isNaN(num)) return formatoCOP.format(num);
    }

    const num = Number(valor ?? 0);
    if (!Number.isNaN(num)) return formatoCOP.format(num);

    return formatoCOP.format(0);
  };

  const nombreVisible = (nombreOriginal) => {
    const key = normalizarNombre(nombreOriginal);

    if (key === "manicure" || key === "manicura") {
      return "Cambio de esmalte";
    }

    if (key === "pedicure" || key === "pedicura") {
      return "Pedicura cambio de esmalte";
    }

    return nombreOriginal;
  };

  const duracionVisible = (servicio) => {
    const key = normalizarNombre(servicio?.nombre);

    if (key === "manicure" || key === "manicura") return 20;
    if (key === "pedicure" || key === "pedicura") return 20;

    const dur = Number(servicio?.duracionMinutos ?? servicio?.duracion ?? 0);
    return dur > 0 ? dur : 30;
  };

  const servicios = useMemo(
    () => deduplicarServicios(serviciosRaw),
    [serviciosRaw]
  );

  useEffect(() => {
    const usuario = safeJSONParse(localStorage.getItem("usuario"), null);
    const role = String(usuario?.role || "").trim().toLowerCase();

    if (!usuario || role !== "admin") {
      alert("Acceso denegado. Solo administradores.");
      navigate("/", { replace: true });
      return;
    }

    fetchServicios();
    fetchCitas();
    fetchProfesionales();
    fetchProductos();
  }, [navigate]);

  const fetchServicios = async () => {
    try {
      setLoadingServicios(true);

      const res = await fetch(`${API_URL}/api/servicios`);
      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(data.message || "No se pudieron cargar los servicios");
      }

      const lista = extraerArray(data, "servicios");
      setServiciosRaw(lista);
    } catch (error) {
      console.error("Error servicios:", error);
      setServiciosRaw([]);
    } finally {
      setLoadingServicios(false);
    }
  };

  const fetchCitas = async () => {
    try {
      setLoadingCitas(true);
      setErrorCitas("");

      const res = await fetch(`${API_URL}/api/citas`);
      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(data.message || "No se pudieron cargar las citas");
      }

      const lista = extraerArray(data, "citas");
      setCitas(ordenarCitas(lista));
    } catch (error) {
      console.error("Error citas:", error);
      setErrorCitas(error.message || "No se pudieron cargar las citas");
      setCitas([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  const fetchProfesionales = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profesionales`);
      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(
          data.message || "No se pudieron cargar los profesionales"
        );
      }

      const lista = extraerArray(data, "profesionales");
      setProfesionales(lista);
    } catch (error) {
      console.error("Error profesionales:", error);
      setProfesionales([]);
    }
  };

  const fetchProductos = async () => {
    try {
      setLoadingProductos(true);

      let res = await fetch(`${API_URL}/api/productos/admin`);

      if (!res.ok) {
        res = await fetch(`${API_URL}/api/productos`);
      }

      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(data.message || "No se pudieron cargar los productos");
      }

      const lista = extraerArray(data, "productos");
      setProductos(lista);
    } catch (error) {
      console.error("Error productos:", error);
      setProductos([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  const toggleServicio = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/servicios/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(data.error || data.message || "Error cambiando estado");
      }

      await fetchServicios();
    } catch (e) {
      console.error("Error toggle servicio:", e);
      alert(e.message || "No se pudo cambiar el estado del servicio.");
    }
  };

  const toggleProfesional = async (id, activo) => {
    try {
      const res = await fetch(`${API_URL}/api/profesionales/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !activo }),
      });

      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(
          data.error || data.message || "No se pudo cambiar el estado"
        );
      }

      await fetchProfesionales();
    } catch (e) {
      console.error("Error toggle profesional:", e);
      alert(e.message || "No se pudo cambiar el estado del profesional.");
    }
  };

  const toggleProducto = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/productos/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(
          data.error || data.message || "No se pudo cambiar el estado"
        );
      }

      await fetchProductos();
    } catch (e) {
      console.error("Error toggle producto:", e);
      alert(e.message || "No se pudo cambiar el estado del producto.");
    }
  };

  const eliminarCita = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta cita?"
    );

    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/api/citas/${id}`, {
        method: "DELETE",
      });

      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(data.message || "No se pudo eliminar la cita");
      }

      await fetchCitas();
    } catch (error) {
      console.error("Error eliminando cita:", error);
      alert(error.message || "No se pudo eliminar la cita");
    }
  };

  const iniciarEdicionPrecio = (servicio) => {
    setErrorPrecio("");
    setEditandoId(servicio._id);
    setPrecioEditado(String(servicio.precio ?? ""));
  };

  const cancelarEdicionPrecio = () => {
    setErrorPrecio("");
    setEditandoId(null);
    setPrecioEditado("");
  };

  const guardarPrecio = async (id) => {
    setErrorPrecio("");

    const precioNum = Number(precioEditado);

    if (precioEditado === "" || Number.isNaN(precioNum)) {
      setErrorPrecio("El precio debe ser un número.");
      return;
    }

    if (precioNum < 0) {
      setErrorPrecio("El precio no puede ser negativo.");
      return;
    }

    try {
      setGuardandoPrecio(true);

      const res = await fetch(`${API_URL}/api/servicios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ precio: precioNum }),
      });

      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(
          data.error || data.message || "No se pudo actualizar el precio."
        );
      }

      const precioActualizado = Number(
        data?.precio ?? data?.servicio?.precio ?? precioNum
      );

      setServiciosRaw((prev) =>
        prev.map((s) =>
          String(s._id) === String(id)
            ? { ...s, precio: precioActualizado }
            : s
        )
      );

      setEditandoId(null);
      setPrecioEditado("");
    } catch (e) {
      console.error("Error al guardar precio:", e);
      setErrorPrecio(e.message || "Error al actualizar precio.");
    } finally {
      setGuardandoPrecio(false);
    }
  };

  const iniciarEdicionProducto = (producto) => {
    setErrorProducto("");
    setEditandoProductoId(producto._id);
    setPrecioProductoEditado(String(producto.precio ?? ""));
  };

  const cancelarEdicionProducto = () => {
    setErrorProducto("");
    setEditandoProductoId(null);
    setPrecioProductoEditado("");
  };

  const guardarPrecioProducto = async (id) => {
    try {
      setErrorProducto("");

      const precioNum = Number(precioProductoEditado);

      if (
        precioProductoEditado === "" ||
        Number.isNaN(precioNum) ||
        precioNum < 0
      ) {
        setErrorProducto("El precio debe ser un número válido.");
        return;
      }

      setGuardandoProducto(true);

      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ precio: precioNum }),
      });

      const data = await leerRespuesta(res);

      if (!res.ok) {
        throw new Error(
          data.error || data.message || "No se pudo actualizar el precio"
        );
      }

      const precioActualizado = Number(
        data?.precio ?? data?.producto?.precio ?? precioNum
      );

      setProductos((prev) =>
        prev.map((p) =>
          String(p._id) === String(id)
            ? { ...p, precio: precioActualizado }
            : p
        )
      );

      setEditandoProductoId(null);
      setPrecioProductoEditado("");
    } catch (e) {
      console.error("Error guardando precio producto:", e);
      setErrorProducto(e.message || "No se pudo actualizar el precio.");
    } finally {
      setGuardandoProducto(false);
    }
  };

  return (
    <div className="admin-dashboard" style={{ paddingTop: "120px" }}>
      <h1 className="admin-title">Panel Administrativo</h1>

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
      </div>

      <section className="admin-section">
        <h2>Todas las citas reservadas</h2>

        {loadingCitas ? (
          <p>Cargando citas...</p>
        ) : errorCitas ? (
          <p style={{ color: "red" }}>{errorCitas}</p>
        ) : citas.length === 0 ? (
          <p style={{ color: "red" }}>No hay citas registradas</p>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Servicio</th>
                <th>Profesional</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {citas.map((cita) => (
                <tr key={cita._id}>
                  <td>{obtenerCliente(cita)}</td>
                  <td>{obtenerCorreo(cita)}</td>
                  <td>{obtenerTelefono(cita) || "—"}</td>
                  <td>{obtenerServicio(cita)}</td>
                  <td>{obtenerProfesional(cita, mapaProfesionales)}</td>
                  <td>{formatearFecha(cita.inicio || cita.fecha)}</td>
                  <td>{formatearHora(cita)}</td>
                  <td>
                    <span className={claseEstadoCita(cita)}>
                      {obtenerEstado(cita)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-desactivar"
                      onClick={() => eliminarCita(cita._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-section">
        <h2>Servicios disponibles</h2>

        {loadingServicios ? (
          <p>Cargando servicios...</p>
        ) : servicios.length === 0 ? (
          <p style={{ color: "red" }}>No hay servicios registrados</p>
        ) : (
          <>
            {errorPrecio && <p className="error-msg">{errorPrecio}</p>}

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
                    <td>{nombreVisible(s.nombre)}</td>
                    <td>{duracionVisible(s)} min</td>
                    <td>{s.descripcion}</td>

                    <td>
                      {editandoId === s._id ? (
                        <div className="precio-editor">
                          <span className="peso-signo">$</span>

                          <input
                            type="number"
                            min="0"
                            value={precioEditado}
                            onChange={(e) => setPrecioEditado(e.target.value)}
                            className="precio-input"
                          />
                        </div>
                      ) : (
                        <span className="precio-texto">
                          {mostrarPrecio(s.precio)}
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={s.activo ? "badge badge-ok" : "badge badge-off"}
                      >
                        {s.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="acciones-col">
                      <button
                        className={s.activo ? "btn-desactivar" : "btn-activar"}
                        onClick={() => toggleServicio(s._id)}
                        disabled={guardandoPrecio && editandoId === s._id}
                      >
                        {s.activo ? "Desactivar" : "Activar"}
                      </button>

                      {editandoId === s._id ? (
                        <>
                          <button
                            className="btn btn-primary"
                            onClick={() => guardarPrecio(s._id)}
                            disabled={guardandoPrecio}
                          >
                            {guardandoPrecio ? "Guardando..." : "Guardar"}
                          </button>

                          <button
                            className="btn btn-secondary"
                            onClick={cancelarEdicionPrecio}
                            disabled={guardandoPrecio}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-outline"
                          onClick={() => iniciarEdicionPrecio(s)}
                        >
                          Editar precio
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <section className="admin-section">
        <h2>Profesionales</h2>

        <table className="styled-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {profesionales.map((p) => (
              <tr key={p._id}>
                <td>{p.nombre}</td>
                <td>{p.especialidad}</td>

                <td>
                  <span className={p.activo ? "badge badge-ok" : "badge badge-off"}>
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td>
                  <button
                    className={p.activo ? "btn-desactivar" : "btn-activar"}
                    onClick={() => toggleProfesional(p._id, p.activo)}
                  >
                    {p.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <h2>Productos disponibles</h2>

        {loadingProductos ? (
          <p>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p style={{ color: "red" }}>No hay productos registrados</p>
        ) : (
          <>
            {errorProducto && <p className="error-msg">{errorProducto}</p>}

            <table className="styled-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((p) => (
                  <tr key={p._id}>
                    <td>{p.nombre}</td>
                    <td>{p.descripcion}</td>

                    <td>
                      {editandoProductoId === p._id ? (
                        <div className="precio-editor">
                          <span className="peso-signo">$</span>

                          <input
                            type="number"
                            min="0"
                            value={precioProductoEditado}
                            onChange={(e) =>
                              setPrecioProductoEditado(e.target.value)
                            }
                            className="precio-input"
                          />
                        </div>
                      ) : (
                        <span className="precio-texto">
                          {mostrarPrecio(p.precio)}
                        </span>
                      )}
                    </td>

                    <td>
                      <span className={p.activo ? "badge badge-ok" : "badge badge-off"}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="acciones-col">
                      <button
                        onClick={() => toggleProducto(p._id)}
                        className={p.activo ? "btn-desactivar" : "btn-activar"}
                        disabled={
                          guardandoProducto && editandoProductoId === p._id
                        }
                      >
                        {p.activo ? "Desactivar" : "Activar"}
                      </button>

                      {editandoProductoId === p._id ? (
                        <>
                          <button
                            className="btn btn-primary"
                            onClick={() => guardarPrecioProducto(p._id)}
                            disabled={guardandoProducto}
                          >
                            {guardandoProducto ? "Guardando..." : "Guardar"}
                          </button>

                          <button
                            className="btn btn-secondary"
                            onClick={cancelarEdicionProducto}
                            disabled={guardandoProducto}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-outline"
                          onClick={() => iniciarEdicionProducto(p)}
                        >
                          Editar precio
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminPanel;