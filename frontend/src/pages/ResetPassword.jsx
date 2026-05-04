import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// IMPORTANTE: Forzamos el puerto 5000 que es donde corre tu backend
const API_URL = "http://localhost:5000/api";

function ResetPassword() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Las contraseñas no coinciden");

    setLoading(true);
    try {
      // La petición DEBE ir a http://localhost:5000/api/auth/reset-password
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("¡Éxito! Contraseña actualizada.");
        navigate("/login");
      } else {
        alert(data.message || "Error al actualizar.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor en el puerto 5000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Crea tu nueva contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Procesando..." : "Actualizar Contraseña"}</button>
      </form>
    </div>
  );
}

export default ResetPassword;