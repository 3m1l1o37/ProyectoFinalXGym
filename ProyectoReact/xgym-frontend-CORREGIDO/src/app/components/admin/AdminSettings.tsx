import { Save, Bell, Eye, MessageSquare } from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import { useToast } from "../../hooks/useToast";
import { useState } from "react";
import { saveFeedSettings } from "../../services/api";
import type { FeedSettings } from "../../types";

/**
 * AdminSettings.tsx — diseño ORIGINAL conservado byte a byte.
 * Cambios: reemplaza useState local por useSettings (estado global,
 * req.8), y `alert()` por toast + llamada async (req.13/15).
 */
export function AdminSettings() {
  const { settings, setSettings } = useSettings();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Función genérica anidada para actualizar un campo (req.10)
  function updateField<K extends keyof FeedSettings>(key: K, value: FeedSettings[K]) {
    setSettings({ ...settings, [key]: value });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveFeedSettings(settings);
      showToast("Configuración guardada exitosamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo guardar.", "danger");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración del Feed</h1>
        <p className="text-gray-600">Administra el comportamiento del feed comunitario</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Posts Settings */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Publicaciones</h2>
          </div>
          <div className="space-y-4">
            <ToggleRow label="Permitir comentarios" description="Los usuarios pueden comentar en las publicaciones" id="allowComments" checked={settings.allowComments} onChange={(v) => updateField("allowComments", v)} />
            <ToggleRow label="Permitir me gusta" description="Los usuarios pueden dar me gusta a publicaciones" id="allowLikes" checked={settings.allowLikes} onChange={(v) => updateField("allowLikes", v)} />
            <ToggleRow label="Permitir compartir" description="Los usuarios pueden compartir publicaciones" id="allowSharing" checked={settings.allowSharing} onChange={(v) => updateField("allowSharing", v)} />
            <div className="pt-4">
              <label htmlFor="maxPostLength" className="font-medium text-gray-900 block mb-2">
                Longitud máxima de publicación
              </label>
              <input
                id="maxPostLength"
                type="number"
                value={settings.maxPostLength}
                onChange={(e) => updateField("maxPostLength", parseInt(e.target.value))}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
              />
              <p className="text-sm text-gray-600 mt-1">Caracteres máximos por publicación</p>
            </div>
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Moderación</h2>
          </div>
          <div className="space-y-4">
            <ToggleRow label="Moderar comentarios" description="Los comentarios requieren aprobación antes de publicarse" id="moderateComments" checked={settings.moderateComments} onChange={(v) => updateField("moderateComments", v)} />
            <ToggleRow label="Auto-aprobar publicaciones" description="Las publicaciones se muestran inmediatamente sin revisión" id="autoApprove" checked={settings.autoApprove} onChange={(v) => updateField("autoApprove", v)} />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
          </div>
          <ToggleRow label="Notificar nuevas publicaciones" description="Recibir notificación cuando se cree una nueva publicación" id="notifyNewPosts" checked={settings.notifyNewPosts} onChange={(v) => updateField("notifyNewPosts", v)} />
        </div>

        {/* Save Button */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToggleRowProps { label: string; description: string; id: string; checked: boolean; onChange: (v: boolean) => void; }

function ToggleRow({ label, description, id, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <label htmlFor={id} className="font-medium text-gray-900">{label}</label>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5 text-red-600 rounded focus:ring-red-600" />
    </div>
  );
}
