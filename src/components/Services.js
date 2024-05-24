// Services.js
import React, { useState } from 'react';
import './Services.css';

function Services() {
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Aquí puedes enviar la información al servidor para que se registre el servicio agendado
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ service, date, time })
      });
      if (response.ok) {
        console.log('Servicio agendado correctamente.');
        // Puedes hacer algo aquí, como mostrar un mensaje de éxito al usuario
      } else {
        console.error('Error al agendar el servicio.');
        // Puedes mostrar un mensaje de error al usuario si el registro falla
      }
    } catch (error) {
      console.error('Error:', error);
      // Manejo de errores en caso de problemas de red, etc.
    }
  };

  return (
    <div className="Services">
      <h2>Agendar Cita</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Servicio:
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Seleccione un servicio</option>
            <option value="Manicura">Manicura</option>
            <option value="Pedicura">Pedicura</option>
            <option value="Peinado">Peinado</option>
            <option value="Aplicación de Tinte">Aplicación de Tinte</option>
            <option value="Depilación">Depilación</option>
          </select>
        </label>
        <label>
          Fecha:
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Hora:
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <button type="submit">Agendar</button>
      </form>

      <p>PATTY SPA es una plataforma que permite conectar a clientes en Bogotá con Profesionales de Belleza
      que prestan servicios a Domicilio
      </p>
      <h2>Manicure & Pedicure</h2>
      <p>Cuidamos tus uñas con los mejores productos, esmaltes con 7 químicos menos que los tradicionales.</p>
      <h2>Peinados</h2>
      <p>¡Sin salir de casa lista para tus ocasiones especiales! Look completo de día o de noche con profesionales
         capacitadas.</p>
      <h2>Depilación con Cera</h2>
      <p>Miel de abejas dermatológicamente comprobada para piel sensible. </p>
      <h2>¡Pregunta por nuestro bono regalo!</h2>
      <h2>Encuéntranos en Instagram y Facebook como "PATTY SPA"</h2>
      <p></p>
      <p>Contáctanos para resolver tus dudas: 3196110585 (WhatsApp)</p>
      <p>Métodos de pago: efectivo, PSE, transferencia bancaria.</p>
    </div>
  );
}

export default Services;
