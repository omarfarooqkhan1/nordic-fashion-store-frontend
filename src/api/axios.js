// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // 🔁 Update this to your actual Laravel backend URL
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔒 Needed if you're using Laravel Sanctum for auth
});

export default api;