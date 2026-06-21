import { FormEvent, useState, useEffect } from "react";
import { X } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { updateMemberById } from "../../services/api";

/**
 * EditMemberModal.tsx
 * -----------------------------------------------------------------------
 * Modal de edición de miembro (CAMBIO en ABCC).
 * Usa formulario CONTROLADO con useState (req.16).
 * Llama updateMemberById desde services/api para persistir el cambio
 * real en la BD vía PUT /api/members/:id, así el cambio se refleja en
 * la tabla sin necesidad de recargar la página.
 *
 * Se agrega el campo "Plan" (subscriptionType): antes no existía en este
 * modal, así que el admin no tenía forma de cambiar el plan de un miembro
 * ni desde aquí ni desde el lado del usuario.
 */

const AVAILABLE_PLANS = ["Básico", "Mensual", "Premium", "Premium Trimestral", "Premium Anual"];

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  memberSince?: string;
  subscriptionType?: string;
}

interface EditMemberModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}
// EditMemberModal.tsx (HIJO) — recibe esas props por destructuring
export function EditMemberModal({
  member,
  isOpen,
  onClose,
  onSuccess,
}: EditMemberModalProps) {
  const [formData, setFormData] = useState<Member>(
    member || {
      id: 0,
      name: "",
      email: "",
      phone: "",
      status: "active",
    }
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // useEffect de ACTUALIZACIÓN (req.6): sincroniza formulario cuando
  // cambia el miembro seleccionado desde la tabla.
  useEffect(() => {
    if (member) {
      setFormData(member);
      setErrors({});
    }
  }, [member]);

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (formData.phone.length < 10) {
      newErrors.phone = "Teléfono debe tener al menos 10 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Persistencia real en la BD (req.ABCC — CAMBIO)
      await updateMemberById(formData.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        subscriptionType: formData.subscriptionType,
      });

      showToast(" Miembro actualizado exitosamente", "success");
      onSuccess();
      onClose();
    } catch (error) {
      showToast(" Error al actualizar miembro", "danger");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen || !member) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold">Editar Miembro</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition ${
                errors.email ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition ${
                errors.phone ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <select
              value={formData.subscriptionType ?? "Básico"}
              onChange={(e) =>
                setFormData({ ...formData, subscriptionType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
            >
              {AVAILABLE_PLANS.map((plan) => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "active" | "inactive",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
