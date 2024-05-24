import React, { useState } from 'react';

function AppointmentForm() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [availability, setAvailability] = useState(false);

  const handleDateChange = (e) => {
    setDate(e.target.value);
    // Aquí puedes agregar la lógica para verificar la disponibilidad en la fecha seleccionada
    // Por ejemplo, puedes enviar una solicitud al servidor para verificar si hay citas disponibles en esa fecha
    // y luego actualizar el estado de 'availability' en función de la respuesta del servidor
    // setAvailability(true); // Ejemplo de actualización del estado de disponibilidad
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para enviar la cita al servidor para su registro
    console.log('Fecha de cita:', date);
    console.log('Hora de cita:', time);
  };

  return (
    <div>
      <h2>Agendar Cita</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Fecha de cita:</label>
          <input type="date" value={date} onChange={handleDateChange} />
        </div>
        <div>
          <label>Hora de cita:</label>
          <input type="time" value={time} onChange={handleTimeChange} />
        </div>
        {availability ? (
          <p>La hora seleccionada está disponible.</p>
        ) : (
          <p>Lo sentimos, la hora seleccionada no está disponible. Por favor, elige otra hora.</p>
        )}
        <button type="submit">Agendar Cita</button>
      </form>
    </div>
  );
}

export default AppointmentForm;
