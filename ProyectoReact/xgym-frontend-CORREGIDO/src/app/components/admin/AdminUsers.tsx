import { useMemo, useState, useCallback } from "react";
import { Outlet, useSearchParams, useNavigate } from "react-router";
import { Search, Mail, Phone, Calendar, Trash2 } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useDebounce } from "../../hooks/useDebounce";
import { useToast } from "../../hooks/useToast";
import { 
  getMembers,
  createMember,
  updateMemberById,
  deleteMember
} from "../../services/api";
import { Spinner } from "../common/Spinner";
import { ErrorState } from "../common/ErrorState";
import { UserSearchForm } from "./UserSearchForm";
import { CreateMemberModal } from "./CreateMemberModal";
import { EmptyState } from "../common/EmptyState";
import { EditMemberModal } from "./EditMemberModal";
import Swal from "sweetalert2";

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  memberSince?: string;
  subscriptionType?: string;
}

export function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const query = searchParams.get("q") ?? "";
  const statusFilter = searchParams.get("status") ?? "all";
  const debouncedQuery = useDebounce(query, 300);

  const { data: members, status, error, refetch } = useFetch(
    () => getMembers(),
    []
  );

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Filtrado con useMemo
  const filteredUsers = useMemo(() => {
    if (!members) return [];
    return members.filter((u) => {
      const matchQ =
        u.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [members, debouncedQuery, statusFilter]);

  // useCallback: memorizar función para evitar recrearla
  const handleDeleteMember = useCallback(
  async (memberId: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar miembro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteMember(memberId);

      await Swal.fire({
        title: "¡Eliminado!",
        text: "El miembro fue eliminado correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      showToast(" Miembro eliminado exitosamente", "success");
      refetch();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el miembro.",
        icon: "error",
      });

      showToast(" Error al eliminar miembro", "danger");
    }
  },
  [refetch, showToast]
);

  function updateQuery(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next);
  }

  function updateStatus(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    setSearchParams(next);
  }

  function handleEditClick(member: Member) {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  }

  function handleCreateSuccess() {
    refetch();
  }

  function handleEditSuccess() {
    refetch();
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Usuarios</h1>
          <p className="text-gray-600">Gestiona los miembros del gimnasio</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
        >
          + Nuevo Miembro
        </button>
      </div>

      {/* Formulario de búsqueda con useRef */}
      <UserSearchForm
        onSearch={(name, status) => {
          updateQuery(name);
          updateStatus(status);
        }}
      />

      {/* Estados de carga y error */}
      {status === "loading" && <Spinner label="Cargando miembros..." />}
      {status === "error" && (
        <ErrorState message={error ?? "Error desconocido."} onRetry={refetch} />
      )}

      {status === "success" && (
        <>
          {/* Tabla */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suscripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 font-bold">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">{user.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {user.subscriptionType || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === "active" ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm font-medium transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteMember(user.id)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-1 text-sm font-medium transition"
                            >
                              <Trash2 className="w-3 h-3" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8">
                        <EmptyState
                          title="Sin resultados"
                          description="No se encontraron usuarios con los criterios de búsqueda"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info de resultados */}
          <div className="text-sm text-gray-600">
            Mostrando {filteredUsers.length} de {members?.length ?? 0} usuarios
          </div>
        </>
      )}

      {/* Modales */}
      <CreateMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditMemberModal
        member={selectedMember}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* Outlet para ruta anidada */}
      <Outlet />
    </div>
  );
}