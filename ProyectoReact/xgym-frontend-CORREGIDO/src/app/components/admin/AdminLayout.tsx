import { Outlet, useNavigate } from "react-router";
import { Users, CreditCard, Settings, Home } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "../common/Sidebar";

/**
 * AdminLayout.tsx — diseño ORIGINAL conservado vía componente <Sidebar>.
 * Cambios: se elimina el useEffect con localStorage directo (centralizado
 * en <ProtectedRoute>), se usa NavLink a través de <Sidebar> (req.20d),
 * y se consume el estado global de auth (req.8).
 */
const MENU_ITEMS = [
  { path: "/admin", icon: Home, label: "Feed Comunitario", end: true },
  { path: "/admin/users", icon: Users, label: "Usuarios" },
  { path: "/admin/subscriptions", icon: CreditCard, label: "Suscripciones" },
  { path: "/admin/settings", icon: Settings, label: "Configuración" },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar subtitle="Panel Admin" items={MENU_ITEMS} onLogout={handleLogout} />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
