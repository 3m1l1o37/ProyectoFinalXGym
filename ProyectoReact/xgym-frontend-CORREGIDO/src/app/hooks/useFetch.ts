import { useCallback, useEffect, useState } from "react";
import type { RequestStatus } from "../types";

/**
 * hooks/useFetch.ts
 * -----------------------------------------------------------------------
 * Hook personalizado (requisitos 7 y 23). Encapsula el patrón de:
 *   1) disparar una petición asíncrona al montar el componente,
 *   2) volver a dispararla cuando cambian sus dependencias (actualización),
 *   3) ignorar la respuesta si el componente se desmonta antes de que la
 *      promesa resuelva (limpieza de efectos).
 *
 * Demuestra en un solo lugar: useEffect (montaje/actualización/limpieza),
 * useState, Promesas, async/await y los estados loading/success/error.
 */
interface UseFetchResult<T> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: React.DependencyList = []): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    // Flag de "componente vivo": limpieza de efectos (requisito 6). Si el
    // efecto se vuelve a ejecutar o el componente se desmonta antes de que
    // la promesa resuelva, ignoramos el resultado.
    let isActive = true;

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const result = await fetcher();
        if (isActive) {
          setData(result);
          setStatus("success");
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, status, error, isLoading: status === "loading", refetch };
}
