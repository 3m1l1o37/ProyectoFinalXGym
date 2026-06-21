import { useParams } from "react-router";
import { Mail, Phone, Calendar, TrendingUp, Award, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../hooks/useToast";
import { getMemberById, updateMemberById } from "../../services/api";
import { Spinner } from "../common/Spinner";
import { ErrorState } from "../common/ErrorState";

/**
 * AdminUserDetail.tsx
 * -----------------------------------------------------------------------
 * Ruta CON PARÁMETRO (req.20a): /admin/users/:userId.
 * Usa `useParams()` para leer el ID; cada vez que cambia (otro usuario
 * seleccionado), useFetch dispara una nueva petición (useEffect de
 * actualización, req.6).
 */
export function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const numericId = Number(userId);
  const { showToast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const { data: member, status, error, refetch } = useFetch(
    () => getMemberById(numericId),
    [numericId]
  );

  async function handleToggleStatus() {
    if (!member) return;
    setIsToggling(true);
    try {
      const next = member.status === "active" ? "inactive" : "active";
      await updateMemberById(member.id, { status: next });
      showToast(`Estado actualizado a ${next === "active" ? "Activo" : "Inactivo"}.`, "success");
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo actualizar.", "danger");
    } finally {
      setIsToggling(false);
    }
  }

  if (status === "loading") return <Spinner label="Cargando miembro..." />;
  if (status === "error") return <ErrorState message={error ?? "Error desconocido."} onRetry={refetch} />;
  if (!member) return <ErrorState message={`No existe un miembro con id ${userId}.`} />;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {member.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {member.status === "active" ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <InfoField icon={Mail} label="Email" value={member.email} />
        <InfoField icon={Phone} label="Teléfono" value={member.phone} />
        <InfoField icon={Calendar} label="Miembro desde" value={member.memberSince} />
        <InfoField icon={TrendingUp} label="Visitas totales" value={String(member.totalVisits)} />
        <InfoField icon={Award} label="Racha actual" value={`${member.currentStreak} días`} />
        <InfoField icon={Award} label="Récords personales" value={String(member.personalRecords)} />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {member.subscriptionType}
        </span>
        <button
          onClick={handleToggleStatus}
          disabled={isToggling}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 disabled:opacity-60 transition-colors"
        >
          {member.status === "active"
            ? <ToggleRight className="w-5 h-5 text-green-600" />
            : <ToggleLeft className="w-5 h-5 text-gray-400" />}
          {isToggling ? "Actualizando..." : "Cambiar estado"}
        </button>
      </div>
    </div>
  );
}

interface InfoFieldProps { icon: typeof Mail; label: string; value: string; }

function InfoField({ icon: Icon, label, value }: InfoFieldProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}
