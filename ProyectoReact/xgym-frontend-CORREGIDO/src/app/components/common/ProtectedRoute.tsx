import type { ReactNode } from "react";
import { Navigate } from "react-router";
import type { Role } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "./Spinner";

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: ReactNode;
}

/**
 * components/common/ProtectedRoute.tsx
 * -----------------------------------------------------------------------
 * Antes, AdminLayout y UserLayout repetían el mismo useEffect leyendo
 * `localStorage.getItem("userRole")` y redirigiendo. Aquí se centraliza
 * esa lógica como un componente reutilizable (requisito 22):
 *   - Mientras se restaura la sesión, muestra un spinner.
 *   - Si no hay sesión, redirige a "/" (login).
 *   - Si el rol no coincide, redirige a la zona que sí le corresponde.
 *   - Si todo es correcto, renderiza `children` (requisito 21).
 */
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spinner label="Verificando sesión..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  }

  return <>{children}</>;
}
