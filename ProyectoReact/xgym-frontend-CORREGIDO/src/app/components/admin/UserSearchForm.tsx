import { useRef, FormEvent } from "react";
import { Search, RotateCcw } from "lucide-react";

interface UserSearchFormProps {
  onSearch: (name: string, status: string) => void;
}

export function UserSearchForm({ onSearch }: UserSearchFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const statusSelectRef = useRef<HTMLSelectElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = nameInputRef.current?.value || "";
    const status = statusSelectRef.current?.value || "";
    onSearch(name, status);
  }

  function handleReset() {
    if (nameInputRef.current) nameInputRef.current.value = "";
    if (statusSelectRef.current) statusSelectRef.current.value = "";
    onSearch("", "");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nombre
          </label>
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Buscar miembro..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
            defaultValue=""
          />
        </div>

        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Estado
          </label>
          <select
            ref={statusSelectRef}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
            defaultValue=""
          >
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <div className="flex gap-2 items-end">
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      </div>
    </form>
  );
}