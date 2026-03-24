const getFallbackApiUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return "https://TU-BACKEND.onrender.com";
};

const API_URL = (
  process.env.REACT_APP_API_URL || getFallbackApiUrl()
).replace(/\/$/, "");

const parseResponse = async (res) => {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text || "Respuesta inválida del servidor",
    };
  }
};

const request = async (path, options = {}) => {
  const url = /^https?:\/\//i.test(path) ? path : `${API_URL}${path}`;
  const method = String(options.method || "GET").toUpperCase();

  const headers = {
    ...(options.headers || {}),
  };

  if (options.body && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    method,
    headers,
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    const error = new Error(
      data?.message || data?.error || `Error HTTP ${res.status}`
    );

    error.response = {
      status: res.status,
      data,
    };

    throw error;
  }

  return data;
};

const extraerArray = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const api = {
  async getProfesionales(onlyActive = false) {
    const url = new URL(`${API_URL}/api/profesionales`);

    if (onlyActive) {
      url.searchParams.set("activo", "true");
    }

    const data = await request(url.toString());
    return extraerArray(data, "profesionales");
  },

  async getServicios(onlyActive = false) {
    const data = await request("/api/servicios");
    const lista = extraerArray(data, "servicios");
    return onlyActive ? lista.filter((s) => s?.activo !== false) : lista;
  },

  async getProductos(onlyActive = false) {
    const data = await request("/api/productos");
    const lista = extraerArray(data, "productos");
    return onlyActive ? lista.filter((p) => p?.activo !== false) : lista;
  },

  async login(payload) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async crearCita(payload) {
    return request("/api/citas/agendamiento", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMisCitas({ usuarioId, email }) {
    const url = new URL(`${API_URL}/api/citas/mis-citas`);

    if (usuarioId) url.searchParams.set("usuarioId", usuarioId);
    if (email) url.searchParams.set("email", email);

    return request(url.toString());
  },

  async cancelarCita(id) {
    return request(`/api/citas/${id}/cancelar`, {
      method: "DELETE",
    });
  },
};

export { API_URL };