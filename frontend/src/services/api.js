const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5000"
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

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await parseResponse(res);

  if (!res.ok) {
    const error = new Error(
      data?.message || data?.error || "Error en la solicitud"
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
    const data = await request(`${API_URL}/api/servicios`);
    const lista = extraerArray(data, "servicios");
    return onlyActive ? lista.filter((s) => s.activo !== false) : lista;
  },

  async crearCita(payload) {
    return request(`${API_URL}/api/citas/agendamiento`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    return request(`${API_URL}/api/citas/${id}/cancelar`, {
      method: "DELETE",
    });
  },
};

export { API_URL };