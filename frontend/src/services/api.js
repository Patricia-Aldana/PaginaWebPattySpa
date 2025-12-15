import axios from "axios";

const API_URL = "https://paginawebpattyspabackend.onrender.com/api";

export const api = {

  getProfesionales: async () => {
    const res = await axios.get(`${API_URL}/profesionales`);
    return res.data;
  },

  crearCita: async (citaData) => {
    const res = await axios.post(`${API_URL}/citas/agendamiento`, citaData);
    return res.data;
  },

  getCitas: async () => {
    const res = await axios.get(`${API_URL}/citas`);
    return res.data;
  },

  eliminarCita: async (id) => {
    const res = await axios.delete(`${API_URL}/citas/${id}`);
    return res.data;
  },

  getServicios: async () => {
    const res = await axios.get(`${API_URL}/servicios`);
    return res.data;
  }
};
