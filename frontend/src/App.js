import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import RegisterForm from "./components/RegisterForm";
import AppointmentForm from "./components/AppointmentForm";
import AppointmentsList from "./components/AppointmentsList";
import Profesionales from "./pages/Profesionales";

// ⭐ Nuevo Panel Administrativo
import AdminPanel from "./components/AdminPanel";

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar setCartOpen={setCartOpen} />

      <main style={{ paddingTop: 72 }}>
        <Routes>
          {/* Rutas existentes - NO las toco */}
          <Route path="/" element={<HomePage cartOpen={cartOpen} setCartOpen={setCartOpen} />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/agendamiento" element={<AppointmentForm />} />
          <Route path="/mis-citas" element={<AppointmentsList />} />
          <Route path="/profesionales" element={<Profesionales />} />

          {/* ⭐ NUEVO PANEL ADMINISTRATIVO */}
          <Route path="/panel-administrativo" element={<AdminPanel />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
