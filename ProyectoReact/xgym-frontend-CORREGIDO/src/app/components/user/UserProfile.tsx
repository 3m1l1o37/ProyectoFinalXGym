import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { CreditCard, Mail, Phone, Calendar, Award, TrendingUp } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { getMemberByUsername, updateMemberById, renewSubscriptionRequest } from "../../services/api";
import { Spinner } from "../common/Spinner";
import { ErrorState } from "../common/ErrorState";
import { Modal } from "../common/Modal";

const AVAILABLE_PLANS = ["Básico", "Mensual", "Premium", "Premium Trimestral", "Premium Anual"];

/**
 * UserProfile.tsx — diseño ORIGINAL conservado byte a byte.
 * Cambios: datos reales con useFetch (req.12/13/15), estado global de
 * auth en lugar de `localStorage.getItem("username")` directamente,
 * formulario NO CONTROLADO con useRef para editar contacto (req.17).
 * Se agregan "Renovar Suscripción" y "Cambiar Plan", que antes eran
 * botones sin onClick y no hacían nada: ahora abren un modal que llama
 * a PUT /api/members/:id/renew-subscription (actualiza el plan vigente
 * y registra el cambio en el historial de subscriptions).
 */
export function UserProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const { data: member, status, error, refetch } = useFetch(
    () => getMemberByUsername(user?.username ?? ""),
    [user?.username]
  );

  if (status === "loading") return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1></div>
      <Spinner label="Cargando perfil..." />
    </div>
  );

  if (status === "error") return (
    <div className="max-w-5xl mx-auto p-8">
      <ErrorState message={error ?? "Error desconocido."} onRetry={refetch} />
    </div>
  );

  if (!member) return null;

  const subscriptionStatus = member.status === "active" ? "active" : "inactive";

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-600">Administra tu información personal y suscripción</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {member.name[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  Miembro desde {member.memberSince}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail className="w-4 h-4" /><span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-gray-900">{member.email}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Phone className="w-4 h-4" /><span className="text-sm font-medium">Teléfono</span>
                </div>
                <p className="text-gray-900">{member.phone}</p>
              </div>
            </div>

            {/* Botón "Editar Información" — ahora abre modal no controlado */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Editar Información
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Estadísticas</h2>
          <div className="space-y-4">
            <StatBox icon={TrendingUp} label="Visitas Totales" value={String(member.totalVisits)} color="text-gray-900" />
            <StatBox icon={Calendar} label="Racha Actual" value={`${member.currentStreak} días`} color="text-red-600" />
            <StatBox icon={Award} label="Récords Personales" value={String(member.personalRecords)} color="text-gray-900" />
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Mi Suscripción</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${subscriptionStatus === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {subscriptionStatus === "active" ? "Activa" : "Inactiva"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SubField icon={CreditCard} label="Plan" value={member.subscriptionType} />
          <SubField icon={Calendar} label="Inicio" value={member.memberSince} />
          <SubField icon={Calendar} label="Vencimiento" value="Ver en suscripciones" />
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 mb-1">Racha</p>
            <p className="text-lg font-bold text-red-600">{member.currentStreak} días</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Renovar Suscripción
          </button>
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cambiar Plan
          </button>
        </div>
      </div>

      {/* Modal con formulario NO controlado (req.17) */}
      <EditInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberId={member.id}
        defaultEmail={member.email}
        defaultPhone={member.phone}
        onSaved={refetch}
        showToast={showToast}
      />

      {/* Modal para renovar o cambiar de plan */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        memberId={member.id}
        currentPlan={member.subscriptionType}
        onSaved={refetch}
        showToast={showToast}
      />
    </div>
  );
}

interface StatBoxProps { icon: typeof TrendingUp; label: string; value: string; color: string; }
function StatBox({ icon: Icon, label, value, color }: StatBoxProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <Icon className="w-4 h-4" /><span className="text-sm font-medium">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

interface SubFieldProps { icon: typeof CreditCard; label: string; value: string; }
function SubField({ icon: Icon, label, value }: SubFieldProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <Icon className="w-4 h-4" /><span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface EditInfoModalProps {
  isOpen: boolean; onClose: () => void; memberId: number;
  defaultEmail: string; defaultPhone: string;
  onSaved: () => void; showToast: (msg: string, v: "success" | "danger" | "warning") => void;
}

/**
 * Formulario NO CONTROLADO (req.17): los inputs usan `defaultValue` +
 * `ref` en lugar de `value` + `onChange`. React NO re-renderiza en cada
 * tecla; el valor sólo se lee al enviar el formulario.
 */
function EditInfoModal({ isOpen, onClose, memberId, defaultEmail, defaultPhone, onSaved, showToast }: EditInfoModalProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const email = emailRef.current?.value.trim() ?? "";
    const phone = phoneRef.current?.value.trim() ?? "";

    if (!email.includes("@")) {
      showToast("Ingresa un correo electrónico válido.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      await updateMemberById(memberId, { email, phone });
      showToast("Información actualizada correctamente.", "success");
      onSaved();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo actualizar.", "danger");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Información de Contacto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-email" className="block font-medium text-gray-900 mb-2">Email</label>
          <input
            id="edit-email"
            ref={emailRef}
            type="email"
            defaultValue={defaultEmail}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label htmlFor="edit-phone" className="block font-medium text-gray-900 mb-2">Teléfono</label>
          <input
            id="edit-phone"
            ref={phoneRef}
            type="tel"
            defaultValue={defaultPhone}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancelar</button>
          <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface PlanModalProps {
  isOpen: boolean; onClose: () => void; memberId: number;
  currentPlan: string;
  onSaved: () => void; showToast: (msg: string, v: "success" | "danger" | "warning") => void;
}

/**
 * Modal CONTROLADO (req.16): el plan seleccionado se guarda con useState
 * porque es una selección de UI (radio buttons), no texto libre.
 * Llama a PUT /api/members/:id/renew-subscription, que actualiza el plan
 * vigente del miembro y agrega un registro nuevo al historial de
 * subscriptions con fechas de inicio/fin y monto.
 */
function PlanModal({ isOpen, onClose, memberId, currentPlan, onSaved, showToast }: PlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [isSaving, setIsSaving] = useState(false);

  async function handleConfirm() {
    setIsSaving(true);
    try {
      await renewSubscriptionRequest(memberId, selectedPlan);
      showToast(`Plan actualizado a "${selectedPlan}" correctamente.`, "success");
      onSaved();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo actualizar el plan.", "danger");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renovar o Cambiar Plan">
      <div className="space-y-3">
        {AVAILABLE_PLANS.map((plan) => (
          <label
            key={plan}
            className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedPlan === plan ? "border-red-600 bg-red-50" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="plan"
                value={plan}
                checked={selectedPlan === plan}
                onChange={() => setSelectedPlan(plan)}
                className="w-4 h-4 text-red-600 focus:ring-red-600"
              />
              <span className="font-medium text-gray-900">{plan}</span>
            </div>
            {plan === currentPlan && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Plan actual</span>
            )}
          </label>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancelar</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isSaving ? "Confirmando..." : "Confirmar Plan"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
