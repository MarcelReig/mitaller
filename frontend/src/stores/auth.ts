import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos para el usuario y el estado de autenticación
export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Store de Zustand con persistencia en localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Función para hacer login
      login: (token: string, user: User) => {
        // Guardar token en localStorage para axios interceptor
        localStorage.setItem('auth-token', token);
        
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      
      // Función para hacer logout
      logout: () => {
        // Limpiar token de localStorage
        localStorage.removeItem('auth-token');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      // Función para actualizar datos del usuario
      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage', // Nombre en localStorage
    }
  )
);


