import axios from "axios";

// In production (Render), VITE_API_URL is set to the backend Render URL.
// In development, Vite proxy handles /api → localhost:5001.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
