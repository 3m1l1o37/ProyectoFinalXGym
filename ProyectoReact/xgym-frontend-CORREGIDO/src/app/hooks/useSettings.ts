import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";

/** Hook personalizado para leer/actualizar la configuración global del feed. */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings debe usarse dentro de un <SettingsProvider>.");
  }
  return context;
}
