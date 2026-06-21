import { Outlet, useNavigate } from "react-router";
import { Home, User, Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Sidebar } from "../common/Sidebar";

const MENU_ITEMS = [
  { path: "/user", icon: Home, label: "Feed Comunitario", end: true },
  { path: "/user/profile", icon: User, label: "Mi Perfil" },
  { path: "/user/settings", icon: Settings, label: "Configuración" },
];

export function UserLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar subtitle="Mi Panel" items={MENU_ITEMS} onLogout={handleLogout} />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
