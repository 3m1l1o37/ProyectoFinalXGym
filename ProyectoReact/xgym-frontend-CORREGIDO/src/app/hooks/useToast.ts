import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

/** Hook personalizado para disparar notificaciones desde cualquier componente. */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un <ToastProvider>.");
  }
  return context;
}
