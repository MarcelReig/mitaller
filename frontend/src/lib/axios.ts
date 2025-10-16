import axios from 'axios';

// Configuración de axios con la URL base del backend Django
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true, // Permitir cookies para CSRF tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir JWT token en cada request
axiosInstance.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage (lo guardará Zustand)
    const token = localStorage.getItem('auth-token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos 401, el token expiró o es inválido
    if (error.response?.status === 401) {
      // Limpiar token y redirigir a login
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-storage');
      
      // Solo redirigir si estamos en el cliente
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;


