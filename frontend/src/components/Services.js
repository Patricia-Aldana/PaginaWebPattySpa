// Services.jsx
import React, { useState, useEffect } from 'react';
import './Services.css';
import { api } from '../services/api'; // IMPORTANTE: ajusta la ruta si está en otro lugar

const SERVICES = [
  { id: 'manicura', title: 'Manicura', subtitle: 'Tradicional y semipermanente', icon: '💅' },
  { id: 'pedicura', title: 'Pedicura', icon: '👣' },
  { id: 'peinado', title: 'Peinado', subtitle: 'Look día y noche', icon: '💇‍♀️' },
  { id: 'tinte', title: 'Aplicación de Tinte', icon: '🎨' },
  { id: 'depilacion', title: 'Depilación', icon: '✨' },
];

// Horarios disponibles
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function Services() {
  const [showForm, setShowForm] = useState(false);
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [appointments, setAppointments] = useState([]);
  const [availableTimes, setAvailableTimes] = useState(TIME_SLOTS);

  // 🔵 Cargar citas desde el backend
  useEffect(() => {
    async function loadAppointments() {
      try {
        const citas = await api.getCitas();
        setAppointments(citas);
      } catch (err) {
        console.error("Error cargando citas", err);
      }
    }
    loadAppointments();
  }, []);

  // 🔵 Filtrar horarios ocupados
  useEffect(() => {
    if (!date) {
      setAvailableTimes(TIME_SLOTS);
      return;
    }

    const occupied = appointments
      .filter(app => app.date === date)
      .map(app => app.time);

    setAvailableTimes(TIME_SLOTS.filter(t => !occupied.includes(t)));
  }, [date, appointments]);

  const openForm = (serviceTitle) => {
    setService(serviceTitle);
    setShowForm(true);
    setMessage({ text: '', type: '' });
  };

  const closeForm = () => {
    setShowForm(false);
    setService('');
    setDate('');
    setTime('');
    setName('');
    setPhone('');
    setEmail('');
    setMessage({ text: '', type: '' });
  };

  // 🔵 Enviar cita al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!service || !date || !time || !name || !phone) {
      setMessage({ text: 'Por favor completa todos los campos obligatorios.', type: 'error' });
      return;
    }

    const phoneRegex = /^[0-9+\s()-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      setMessage({ text: 'Por favor ingresa un número de teléfono válido.', type: 'error' });
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setMessage({ text: 'Por favor ingresa un email válido.', type: 'error' });
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setMessage({ text: 'No puedes agendar citas en fechas pasadas.', type: 'error' });
      return;
    }

    setLoading(true);

    const payload = { service, date, time, name, phone, email };

    try {
      const nuevaCita = await api.crearCita(payload);

      setAppointments((prev) => [...prev, nuevaCita]);

      setMessage({
        text: '¡Cita agendada correctamente! Te esperamos en Patty Spa.',
        type: 'success'
      });

      setTimeout(() => closeForm(), 2000);

    } catch (err) {
      console.error('API error:', err);
      setMessage({
        text: 'Error al agendar la cita. Por favor intenta nuevamente.',
        type: 'error'
      });
    }

    setLoading(false);
  };

  // 🔵 Fecha mínima y máxima
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="services-container">
      <header className="services-header">
        <h1>Nuestros Servicios</h1>
        <p className="tagline">
          "La belleza comienza en el momento en que decides cuidarte. Regálate tiempo, regálate paz, regálate Patty Spa".
        </p>
      </header>

      <div className="services-grid">
        {SERVICES.map((s) => (
          <div key={s.id} className="service-card">
            <div className="service-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            {s.subtitle && <p className="service-subtitle">{s.subtitle}</p>}
            <button className="service-button" onClick={() => openForm(s.title)}>
              Agendar Cita
            </button>
          </div>
        ))}
      </div>

      {/* FORMULARIO MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agendar cita: {service}</h2>
              <button className="close-button" onClick={closeForm}>×</button>
            </div>

            <div className="modal-body">
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="appointment-form">
                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email (opcional)</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={today}
                      max={maxDateStr}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Hora *</label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    >
                      <option value="">Selecciona una hora</option>
                      {availableTimes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={closeForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Procesando...' : 'Confirmar Cita'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* LISTA DE CITAS */}
      {appointments.length > 0 && (
        <div className="appointments-section">
          <h2>Mis Citas Agendadas</h2>
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-service">{appointment.service}</div>
                <div className="appointment-datetime">
                  {new Date(appointment.date).toLocaleDateString()} – {appointment.time}
                </div>
                <div className="appointment-client">{appointment.name}</div>
                <div className="appointment-phone">{appointment.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
