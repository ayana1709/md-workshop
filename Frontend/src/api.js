import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // your local backend
  // baseURL: "https://ims.yanoltech.com/api", // production
  headers: { "Content-Type": "application/json" },
});

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
