import { useEffect, useState } from "react";
import { Quote, RotateCw } from "lucide-react";
import { fetchMotivationalAdvice } from "../../services/externalApi";

/**
 * components/common/MotivationalQuote.tsx
 * -----------------------------------------------------------------------
 * Consume una API pública REAL (https://api.adviceslip.com) con `fetch`,
 * demostrando el requisito 14 contra un servidor externo de verdad, junto
 * con: useEffect de montaje, useEffect de limpieza (cancela el fetch con
 * AbortController si el componente se desmonta), async/await + try/catch
 * y estados de carga/éxito/error.
 */
export function MotivationalQuote() {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAdvice() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchMotivationalAdvice(controller.signal);
        setAdvice(result.advice);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("No se pudo cargar la frase del día.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAdvice();

    // Limpieza: cancela la petición HTTP si el componente se desmonta o
    // se vuelve a ejecutar el efecto (botón "Nueva frase").
    return () => controller.abort();
  }, [reloadToken]);

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow p-5 mb-6 flex items-start gap-4">
      <Quote className="w-8 h-8 text-red-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Frase del día</p>
        {isLoading && <p className="text-sm text-gray-300">Cargando frase...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}
        {!isLoading && !error && advice && <p className="italic">"{advice}"</p>}
      </div>
      <button
        onClick={() => setReloadToken((token) => token + 1)}
        className="text-gray-400 hover:text-white transition-colors"
        aria-label="Obtener otra frase"
        title="Obtener otra frase"
      >
        <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
