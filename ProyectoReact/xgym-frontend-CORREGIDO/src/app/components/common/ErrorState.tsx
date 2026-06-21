import { AlertCircle, RotateCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Bloque de error reutilizable. Usa el mismo patrón visual que ya tenía
 * la alerta de "Atención requerida" en AdminSubscriptions (borde
 * izquierdo de color + fondo suave), sólo que en rojo.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="text-sm font-medium text-red-800">Ocurrió un error</h3>
      </div>
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900 mt-2">
          <RotateCw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}
