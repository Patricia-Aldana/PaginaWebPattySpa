
import React, { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOk(false);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await res.json();
      setOk(true); // no revelamos si existe o no
    } catch (err) {
      console.error(err);
      setOk(true); // misma respuesta
    }
  };

  return (
    <div className="login-form-container">
      <h2>Olvidé mi contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <button type="submit">Enviar enlace</button>
      </form>

      {ok && (
        <p>Si el correo existe, te enviamos un enlace para restablecer tu contraseña.</p>
      )}
    </div>
  );
}
``
