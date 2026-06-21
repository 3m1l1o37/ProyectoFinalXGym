import { useEffect, useState } from "react";

/**
 * hooks/useDebounce.ts
 * -----------------------------------------------------------------------
 * Retrasa la actualización de un valor hasta que el usuario deja de
 * escribir durante `delayMs`. Se usa en el buscador de AdminUsers.
 * Ejemplo de useEffect con limpieza: cada cambio de `value` cancela el
 * `setTimeout` anterior (clearTimeout) antes de programar uno nuevo.
 */
export function useDebounce<T>(value: T, delayMs = 350): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
