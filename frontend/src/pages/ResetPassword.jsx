import React, { useState } from "react";

const API_URL = "http://localhost:5000/api";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState(""); // normalmente viene en el link del correo

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      alert(data.mensaje || "Contraseña restablecida correctamente");
    } catch (error) {
      alert("Error al restablecer contraseña");
    }
  };

  return (
    <div>
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Token de recuperación"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Restablecer</button>
      </form>
    </div>
  );
}

export default ResetPassword;