import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser, Role } from "../types";
import { loginRequest, registerRequest, logoutCleanup, changeUsernameRequest } from "../services/api";

/**
 * context/AuthContext.tsx
 * -----------------------------------------------------------------------
 * Manejo de ESTADO GLOBAL en React (requisito 8) usando la Context API.
 * Reemplaza la lógica que antes estaba repetida (y desincronizada) en
 * LoginPage/AdminLayout/UserLayout, que leían/escribían directamente
 * `localStorage.getItem("userRole")`. Se conservan EXACTAMENTE las mismas
 * llaves ("userRole", "username") para no romper nada de tu lógica
 * original, sólo se centraliza en un solo lugar.
 *
 * Props: `children` (requisito 21): AuthProvider envuelve toda la app.
 */
export interface AuthContextValue {
  user: AuthUser | null;
  /** true mientras se restaura la sesión guardada (montaje inicial). */
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (username: string, password: string, email: string) => Promise<AuthUser>;
  logout: () => void;
  /** Cambia el username real en la BD y sincroniza el estado global + localStorage. */
  updateUsername: (newUsername: string) => Promise<AuthUser>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // useEffect de MONTAJE: restaura la sesión guardada en localStorage
  // (mismas llaves que usaba el proyecto original).
  useEffect(() => {
    try {
      const role = window.localStorage.getItem("userRole") as Role | null;
      const username = window.localStorage.getItem("username");
      if (role && username) {
        setUser({ username, role });
      }
    } finally {
      setIsInitializing(false);
    }

    // useEffect con LIMPIEZA: si el usuario cierra sesión en otra pestaña,
    // se sincroniza este tab también.
    function handleStorageChange(event: StorageEvent) {
      if (event.key === "userRole" && !event.newValue) {
        setUser(null);
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  async function login(username: string, password: string): Promise<AuthUser> {
    const authUser = await loginRequest(username, password);
    setUser(authUser);
    window.localStorage.setItem("userRole", authUser.role);
    window.localStorage.setItem("username", authUser.username);
    return authUser;
  }

  async function register(username: string, password: string, email: string): Promise<AuthUser> {
    const authUser = await registerRequest(username, password, email);
    window.localStorage.setItem("userRole", authUser.role);
    window.localStorage.setItem("username", authUser.username);
    setUser(authUser);
    return authUser;
  }

  function logout() {
    setUser(null);
    window.localStorage.removeItem("userRole");
    window.localStorage.removeItem("username");
    logoutCleanup(); // elimina el JWT del localStorage
  }

  async function updateUsername(newUsername: string): Promise<AuthUser> {
    const authUser = await changeUsernameRequest(newUsername);
    setUser(authUser);
    window.localStorage.setItem("username", authUser.username);
    return authUser;
  }

  const value: AuthContextValue = {
    user,
    isInitializing,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    updateUsername,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
