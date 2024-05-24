import React, { useState } from 'react';
import './LoginForm.css'; // Asegúrate de tener este archivo CSS para los estilos del formulario

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica de envío del formulario
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="login-form">
      <h2>Iniciar Sesión</h2> {/* Cambia el texto de "Login" a "Iniciar Sesión" */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label> {/* Cambia "Password" a "Contraseña" */}
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Enviar</button> {/* Cambia el texto del botón si es necesario */}
      </form>
    </div>
  );
}

export default LoginForm;
