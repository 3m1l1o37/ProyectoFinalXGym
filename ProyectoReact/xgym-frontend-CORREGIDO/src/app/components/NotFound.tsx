import { Link } from "react-router";
import { Dumbbell, Home } from "lucide-react";

/**
 * components/NotFound.tsx
 * -----------------------------------------------------------------------
 * Requisito 24. El proyecto original redirigía cualquier ruta
 * desconocida silenciosamente a "/" (`<Navigate to="/" replace />`). Aquí
 * se agrega una página 404 real, en el mismo degradado oscuro que ya
 * usaba el LoginPage.
 */
export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 text-center">
      <div>
        <div className="bg-red-600 p-4 rounded-full mb-6 inline-flex">
          <Dumbbell className="w-10 h-10" />
        </div>
        <p className="text-7xl font-bold text-red-600 mb-2">404</p>
        <h1 className="text-2xl font-bold mb-2">Esta página no existe</h1>
        <p className="text-gray-400 max-w-sm mx-auto mb-8">
          Parece que esta ruta no levanta pesas con nosotros. Revisa la URL o vuelve al inicio.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-6 py-3 rounded-lg font-medium"
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
