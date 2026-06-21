import { Loader2 } from "lucide-react";

interface SpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

/** Indicador de carga reutilizable, en la misma paleta roja del proyecto. */
export function Spinner({ label, size = "md" }: SpinnerProps) {
  return (
    <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center gap-3 text-gray-500">
      <Loader2 className={`${SIZE_CLASSES[size]} animate-spin text-red-600`} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
