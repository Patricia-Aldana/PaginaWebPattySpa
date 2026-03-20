import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import AppointmentForm from "./components/AppointmentForm";
import AppointmentsList from "./components/AppointmentsList";
import Profesionales from "./pages/Profesionales";
import AdminPanel from "./components/AdminPanel";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Productos from "./components/Productos";

import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute";

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar setCartOpen={setCartOpen} />

      <main style={{ paddingTop: 72 }}>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/"
            element={
              <HomePage
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
              />
            }
          />

          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/profesionales" element={<Profesionales />} />
          <Route path="/productos" element={<Productos />} />

          {/* Recuperación de contraseña */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Usuario registrado */}
          <Route
            path="/agendamiento"
            element={
              <RequireAuth>
                <AppointmentForm />
              </RequireAuth>
            }
          />

          <Route
            path="/mis-citas"
            element={
              <RequireAuth>
                <AppointmentsList />
              </RequireAuth>
            }
          />

          {/* Solo admin */}
          <Route
            path="/panel-administrativo"
            element={
              <RequireAdmin>
                <AdminPanel />
              </RequireAdmin>
            }
          />

          {/* Ruta comodín */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;