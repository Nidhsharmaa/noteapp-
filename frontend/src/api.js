//api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", 
});

// Attach JWT token to every request if exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
