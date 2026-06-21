import { useEffect, useState } from "react";

/**
 * hooks/useLocalStorage.ts
 * -----------------------------------------------------------------------
 * Hook genérico que sincroniza un estado de React con `localStorage`,
 * para que el valor sobreviva a recargas de página (ej. configuración
 * global del feed).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage no disponible (modo privado, cuota llena, etc.)
    }
  }, [key, value]);

  return [value, setValue] as const;
}
