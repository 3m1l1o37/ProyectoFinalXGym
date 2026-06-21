/**
 * services/externalApi.ts
 * -----------------------------------------------------------------------
 * A diferencia de `api.ts` (que simula un backend propio), este módulo SÍ
 * realiza una petición real con `fetch` a una API pública externa
 * (adviceslip.com), demostrando el requisito 14 ("Conexión y consumo de
 * APIs con fetch o axios") contra un servidor real fuera de nuestro
 * control. Se usa para la "frase del día" en el feed.
 */

export interface MotivationalAdvice {
  id: number;
  advice: string;
}

const ADVICE_API_URL = "https://api.adviceslip.com/advice";

/** Obtiene una frase motivacional aleatoria desde una API pública real. */
export async function fetchMotivationalAdvice(signal?: AbortSignal): Promise<MotivationalAdvice> {
  const response = await fetch(ADVICE_API_URL, { signal, cache: "no-store" });

  if (!response.ok) {
    throw new Error(`La API de frases respondió con estado ${response.status}`);
  }

  const data = await response.json();

  return {
    id: data?.slip?.id ?? Date.now(),
    advice: data?.slip?.advice ?? "El mejor entrenamiento es el que no dejas de hacer.",
  };
}
