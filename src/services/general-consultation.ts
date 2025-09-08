import axios from 'axios';

// Usamos proxy local en desarrollo para evitar problemas de CORS
export const http = axios.create({
  baseURL: '/api',  // Esto se redirigirá a http://localhost:3005 a través del proxy de Vite
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, */*',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para manejar errores
http.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);