import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterForm.css";

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

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

function RegisterForm() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: correo.trim().toLowerCase(),
          password: contrasena,
        }),
      });

      const data = await leerRespuesta(res);

      if (!res.ok) {
        alert(data.message || "Error al registrar");
        return;
      }

      if (data.usuario) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
      }

      alert("Usuario registrado correctamente");
      navigate("/agendamiento", { replace: true });
    } catch (err) {
      console.error("ERROR REGISTRO:", err);
      alert("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
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
          minLength={6}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Regístrate y agenda tu cita"}
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;