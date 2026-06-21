import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import type { ToastMessage, Variant } from "../types";

/**
 * context/ToastContext.tsx
 * -----------------------------------------------------------------------
 * Segundo estado global de la app (independiente de Auth): notificaciones
 * tipo "toast" que reemplazan los `alert("Configuración guardada...")`
 * que tenía el proyecto original en AdminSettings/UserSettings.
 *
 * APORTACIÓN EXTRA #2 a la lista de requisitos: usamos `createPortal` de
 * react-dom para renderizar el contenedor de toasts directamente en
 * document.body, fuera del árbol normal de React.
 */
interface ToastContextValue {
  showToast: (message: string, variant?: Variant) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS_BY_VARIANT: Record<Variant, typeof CheckCircle2> = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
  neutral: Info,
};

const COLORS_BY_VARIANT: Record<Variant, string> = {
  success: "bg-green-600",
  danger: "bg-red-600",
  warning: "bg-yellow-500",
  info: "bg-blue-600",
  neutral: "bg-gray-800",
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, variant: Variant = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, variant }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const Icon = ICONS_BY_VARIANT[toast.variant];

  // useEffect con limpieza: cierra el toast a los 4s y cancela el timer
  // si se cierra manualmente o se desmonta antes.
  useEffect(() => {
    const timeoutId = setTimeout(onClose, 4000);
    return () => clearTimeout(timeoutId);
  }, [onClose]);

  return (
    <div role="status" className={`${COLORS_BY_VARIANT[toast.variant]} text-white rounded-lg shadow-lg px-4 py-3 flex items-start gap-3`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm flex-1">{toast.message}</p>
      <button onClick={onClose} aria-label="Cerrar notificación" className="opacity-80 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
