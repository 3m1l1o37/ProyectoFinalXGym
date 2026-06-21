import { NavLink } from "react-router";
import type { LucideIcon } from "lucide-react";
import { Dumbbell, LogOut } from "lucide-react";

export interface SidebarItem {
  path: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

/**
 * components/common/Sidebar.tsx
 * -----------------------------------------------------------------------
 * AdminLayout y UserLayout tenían el MISMO markup de sidebar duplicado
 * (sólo cambiaban el subtítulo y los `menuItems`). Se extrae aquí como
 * componente reutilizable al que cada layout le pasa sus propios datos
 * vía PROPS (requisito 3) — el diseño visual es idéntico al original,
 * sólo cambia que ahora es un solo componente compartido.
 *
 * Se reemplaza <Link> + comparación manual de `location.pathname` por
 * <NavLink> (requisito 20.d), que resalta automáticamente la ruta activa
 * con las mismas clases que ya usaba el proyecto (`bg-red-600 text-white`
 * vs `text-gray-300 hover:bg-gray-800`).
 */
interface SidebarProps {
  subtitle: string;
  items: SidebarItem[];
  onLogout: () => void;
}

export function Sidebar({ subtitle, items, onLogout }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-gray-800">
        <div className="bg-red-600 p-2 rounded-lg">
          <Dumbbell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">XGym</h1>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-800"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
