import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../components/HomePage.css";

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="left-nav">
        <img
          src={require("../assets/img/estrella.png")}
          alt="Patty Spa"
          className="spa-logo"
        />
      </div>

      <nav className="nav-links">
        <button onClick={() => navigate("/")}>Inicio</button>
        <button onClick={() => navigate("/agendamiento")}>Agendar</button>
        <button onClick={() => navigate("/mis-citas")}>Mis Citas</button>

        {/* 🔥 Ruta corregida */}
        <button onClick={() => navigate("/panel-administrativo")}>Panel administrativo</button>

        <button onClick={() => navigate("/profesionales")}>Profesionales</button>
      </nav>

      <div className="right-nav" style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link to="/register" style={{ textDecoration: "none" }}>
          <button className="cta-secondary">Regístrate</button>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
