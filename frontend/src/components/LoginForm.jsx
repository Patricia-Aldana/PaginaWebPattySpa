import React, { useState } from "react";
import "./LoginForm.css";
import { useNavigate, Link, useLocation } from "react-router-dom";

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

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await leerRespuesta(res);
      console.log("Respuesta login:", data);

      if (!res.ok) {
        alert(data.message || "Error al iniciar sesión");
        return;
      }

      if (!data.usuario) {
        alert("La respuesta del servidor no incluye usuario");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      const role = String(data.usuario.role || "").trim().toLowerCase();

      // ✅ ADMIN SIEMPRE VA PRIMERO AL PANEL
      if (role === "admin") {
        navigate("/panel-administrativo", { replace: true });
        return;
      }

      // ✅ CLIENTE: si venía de una ruta protegida, vuelve ahí.
      // Si no, va al inicio.
      const params = new URLSearchParams(location.search);
      const next = params.get("next");

      if (next) {
        navigate(next, { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error login:", error);
      alert("No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Iniciar sesión</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: "10px" }}>
        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
      </p>
    </div>
  );
}

export default LoginForm;