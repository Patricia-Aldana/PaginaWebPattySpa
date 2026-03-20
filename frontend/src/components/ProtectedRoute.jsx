import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const safeJSONParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getUsuario = () => {
  return safeJSONParse(localStorage.getItem("usuario"), null);
};

export const RequireAuth = ({ children }) => {
  const location = useLocation();
  const usuario = getUsuario();

  if (!usuario) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return children;
};

export const RequireAdmin = ({ children }) => {
  const usuario = getUsuario();
  const role = String(usuario?.role || "").trim().toLowerCase();

  if (!usuario) {
    return <Navigate to="/login?next=%2Fpanel-administrativo" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};