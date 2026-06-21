import { useSearchParams } from "react-router";
import { Calendar, AlertCircle, CreditCard } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { getSubscriptions } from "../../services/api";
import type { Subscription } from "../../types";
import { Spinner } from "../common/Spinner";
import { ErrorState } from "../common/ErrorState";

/**
 * AdminSubscriptions.tsx — diseño ORIGINAL conservado (tablas, colores,
 * alerta amarilla).
 * Cambios: datos reales con useFetch, query params ?tab= para filtrar
 * entre "todas / próximas / vencidas" (req.20b).
 */
type TabValue = "all" | "expiring" | "expired";

export function AdminSubscriptions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") as TabValue) ?? "all";

  const { data: subscriptions, status, error, refetch } = useFetch(() => getSubscriptions(), []);

  const all = subscriptions ?? [];
  const expiring = all.filter((s) => s.daysRemaining >= 0 && s.daysRemaining <= 30);
  const expired = all.filter((s) => s.daysRemaining < 0);

  function setTab(value: TabValue) {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("tab"); else next.set("tab", value);
    setSearchParams(next);
  }

  function getVisible(): Subscription[] {
    if (tab === "expiring") return expiring;
    if (tab === "expired") return expired;
    return all;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Suscripciones</h1>
        <p className="text-gray-600">Monitorea las suscripciones próximas a vencer</p>
      </div>

      {status === "loading" && <Spinner label="Cargando suscripciones..." />}
      {status === "error" && <ErrorState message={error ?? "Error desconocido."} onRetry={refetch} />}

      {status === "success" && (
        <>
          {/* Alerta original */}
          {(expiring.length > 0 || expired.length > 0) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-sm font-medium text-yellow-800">Atención requerida</h3>
              </div>
              <p className="text-sm text-yellow-700">
                {expiring.length} suscripción(es) vence(n) en los próximos 30 días
                {expired.length > 0 && `, ${expired.length} suscripción(es) vencida(s)`}
              </p>
            </div>
          )}

          {/* Tabs de filtro — query params (req.20b) */}
          <div className="flex gap-2 mb-6">
            {([["all", "Todas", all.length], ["expiring", "Próximas a vencer", expiring.length], ["expired", "Vencidas", expired.length]] as const).map(([value, label, count]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === value ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Tabla principal (diseño original) */}
          {tab !== "expired" && getVisible().length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {tab === "expiring" ? "Próximas a vencer (30 días)" : "Todas las suscripciones"}
              </h2>
              <SubscriptionTable rows={getVisible()} expired={false} />
            </div>
          )}

          {tab === "expired" && expired.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vencidas</h2>
              <SubscriptionTable rows={expired} expired={true} />
            </div>
          )}

          {tab === "all" && expired.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vencidas</h2>
              <SubscriptionTable rows={expired} expired={true} />
            </div>
          )}

          {getVisible().length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No hay suscripciones en esta categoría.
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface SubscriptionTableProps { rows: Subscription[]; expired: boolean; }

function SubscriptionTable({ rows, expired }: SubscriptionTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`border-b ${expired ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
            <tr>
              {["Usuario", "Plan", "Fecha de vencimiento", expired ? "Estado" : "Días restantes", "Monto"].map((h) => (
                <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${expired ? "text-red-700" : "text-gray-500"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 ${expired ? "bg-red-50" : ""}`}>
            {rows.map((sub) => (
              <tr key={sub.id} className={expired ? "hover:bg-red-100" : "hover:bg-gray-50"}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {sub.userName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="ml-4 text-sm font-medium text-gray-900">{sub.userName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{sub.plan}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{sub.endDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {expired
                    ? <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">Vencida hace {Math.abs(sub.daysRemaining)} días</span>
                    : <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${sub.daysRemaining <= 7 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{sub.daysRemaining} días</span>
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
