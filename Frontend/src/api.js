import axios from "axios";

const api = axios.create({
  // baseURL: "https://md.nileworkshop.com/api",
  baseURL: "http://127.0.0.1:8000/api",
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Add token to each request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
