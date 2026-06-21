import { Loader2 } from "lucide-react";

/** Pantalla de carga de página completa, usada como fallback de <Suspense>. */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
    </div>
  );
}
