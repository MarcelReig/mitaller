import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Nombres de las cookies para los tokens
const TOKEN_COOKIE = 'token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * Helper functions para manejo de tokens en cookies
 */

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_COOKIE);
};

export const setToken = (token: string): void => {
  // Guardar por 1 hora (duración del access token)
  Cookies.set(TOKEN_COOKIE, token, {
    expires: 1 / 24, // 1 hora
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_COOKIE);
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_COOKIE);
};

export const setRefreshToken = (token: string): void => {
  // Guardar por 7 días (duración del refresh token)
  Cookies.set(REFRESH_TOKEN_COOKIE, token, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const removeRefreshToken = (): void => {
  Cookies.remove(REFRESH_TOKEN_COOKIE);
};

export const removeAllTokens = (): void => {
  removeToken();
  removeRefreshToken();
};

/**
 * Cliente Axios configurado para el backend Django REST Framework
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // No necesitamos cookies del servidor, manejamos JWT manualmente
});

/**
 * Flag para evitar múltiples intentos de refresh simultáneos
 */
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Agregar requests a la cola mientras se refresca el token
 */
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

/**
 * Ejecutar todos los requests en cola con el nuevo token
 */
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * INTERCEPTOR DE REQUEST
 * Añade el token JWT a cada request si está disponible
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    // Añadir Authorization header si hay token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Asegurar Content-Type para requests con data
    if (config.data && !config.headers?.['Content-Type']) {
      config.headers = config.headers || {};
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPONSE
 * Maneja errores comunes y refresh de tokens
 */
axiosInstance.interceptors.response.use(
  // Si la respuesta es exitosa, simplemente la retornamos
  (response) => response,

  // Manejo de errores
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // --- 401 UNAUTHORIZED: Token expirado o inválido ---
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Evitar loop infinito si el refresh también falla
      if (originalRequest.url?.includes('/auth/token/refresh/')) {
        // El refresh token también expiró
        removeAllTokens();
        
        // Solo redirigir si estamos en el cliente
        if (typeof window !== 'undefined') {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }

      // Marcar que ya intentamos refrescar este request
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          // No hay refresh token, redirigir a login
          removeAllTokens();
          
          if (typeof window !== 'undefined') {
            toast.error('Sesión expirada. Por favor, inicia sesión.');
            window.location.href = '/login';
          }
          
          return Promise.reject(error);
        }

        try {
          // Intentar refrescar el access token
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/token/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;

          // Guardar nuevo token
          setToken(access);
          isRefreshing = false;

          // Reintentar todos los requests en cola con el nuevo token
          onRefreshed(access);

          // Reintentar el request original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh falló, limpiar todo y redirigir
          isRefreshing = false;
          removeAllTokens();
          
          if (typeof window !== 'undefined') {
            toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      }

      // Si ya se está refrescando, esperar a que termine
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    // --- 403 FORBIDDEN: Sin permisos ---
    if (error.response?.status === 403) {
      const message = 
        (error.response.data as Record<string, unknown>)?.detail as string || 
        'No tienes permisos para realizar esta acción';
      
      if (typeof window !== 'undefined') {
        toast.error(message);
      }
    }

    // --- 500 INTERNAL SERVER ERROR ---
    if (error.response?.status === 500) {
      if (typeof window !== 'undefined') {
        toast.error('Error del servidor. Por favor, intenta más tarde.');
      }
    }

    // --- 400 BAD REQUEST: Errores de validación ---
    if (error.response?.status === 400) {
      const errorData = error.response.data as Record<string, unknown>;
      
      // Si hay errores de campo específicos, no mostrar toast aquí
      // Dejar que el componente los maneje
      if (typeof errorData === 'object' && !errorData.detail) {
        // Son errores de validación de campos, no mostrar toast global
        return Promise.reject(error);
      }
      
      // Si hay un mensaje general de error
      if (typeof window !== 'undefined' && errorData.detail) {
        toast.error(errorData.detail as string);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
