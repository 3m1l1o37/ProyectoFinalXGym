interface EmptyStateProps {
  title: string;
  description?: string;
}

/** Igual al bloque "No se encontraron usuarios..." que ya existía en AdminUsers. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
      <p>{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
}
