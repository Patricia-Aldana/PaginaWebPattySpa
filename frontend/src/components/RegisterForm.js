import React, { useState } from "react";
import "./RegisterForm.css";

// ✅ URL DEL BACKEND EN RENDER
const API_URL = "https://paginawebpattyspabackend.onrender.com/api";

function RegisterForm() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre,
          email: correo,
          password: contrasena,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Usuario registrado");
        window.location.href = "/agendamiento";
      } else {
        alert(data.message || "Error al registrar");
      }

    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Registro de Usuario</h2>

        <input
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />

        <button type="submit">Regístrate y agenda tu cita</button>
      </form>
    </div>
  );
}

export default RegisterForm;
