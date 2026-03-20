import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../components/HomePage.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const cargarUsuario = () => {
      const data = localStorage.getItem("usuario");

      if (data) {
        try {
          const usuarioGuardado = JSON.parse(data);
          setUsuario(usuarioGuardado);
        } catch (e) {
          console.error("No se pudo parsear localStorage.usuario", e);
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
    };

    cargarUsuario();

    window.addEventListener("storage", cargarUsuario);

    return () => window.removeEventListener("storage", cargarUsuario);
  }, [location.pathname]);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("pattyspa_cart");
    setUsuario(null);
    navigate("/", { replace: true });
    window.location.reload();
  };

  const roleNormalizado = usuario?.role
    ? String(usuario.role).trim().toLowerCase()
    : "";

  const esAdmin = roleNormalizado === "admin";

  return (
    <header className="navbar">
      <div className="left-nav">
        <Link to="/">
          <img
            src={require("../assets/img/estrella.png")}
            alt="Patty Spa"
            className="spa-logo"
          />
        </Link>
      </div>

      <nav className="nav-links">
        <button onClick={() => navigate("/")}>Inicio</button>

        {usuario ? (
          <button onClick={() => navigate("/agendamiento")}>Agendar</button>
        ) : (
          <button onClick={() => navigate("/login?next=%2Fagendamiento")}>
            Agendar
          </button>
        )}

        {usuario && !esAdmin && (
          <button onClick={() => navigate("/mis-citas")}>Mis Citas</button>
        )}

        {esAdmin && (
          <button onClick={() => navigate("/panel-administrativo")}>
            Panel administrativo
          </button>
        )}

        <button onClick={() => navigate("/profesionales")}>Profesionales</button>
      </nav>

      <div className="right-nav">
        {!usuario ? (
          <>
            <Link to="/login">
              <button className="nav-auth-btn login-btn">Iniciar sesión</button>
            </Link>

            <Link to="/register">
              <button className="nav-auth-btn register-btn">Registrarse</button>
            </Link>
          </>
        ) : (
          <button className="nav-auth-btn logout-btn" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;