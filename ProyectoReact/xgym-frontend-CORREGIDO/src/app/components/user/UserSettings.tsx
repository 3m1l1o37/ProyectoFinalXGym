import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Save, Bell, Lock, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { saveNotificationSettings, changePasswordRequest } from "../../services/api";
import type { NotificationSettings } from "../../types";

/**
 * UserSettings.tsx — diseño ORIGINAL conservado byte a byte.
 * Cambios:
 *   - Sección "Cuenta": antes tenía username + email + teléfono simulados
 *     con un setTimeout falso que no llamaba al backend. Ahora solo
 *     gestiona el USERNAME (credencial de acceso, tabla `users`), que se
 *     guarda de verdad con PUT /api/auth/username. Email y teléfono son
 *     datos del MIEMBRO (tabla `members`) y se editan en "Mi Perfil" para
 *     no tener el mismo campo duplicado y desincronizado en dos pantallas.
 *   - Sección "Seguridad": el cambio de contraseña ahora exige y valida
 *     la contraseña ACTUAL contra la BD (PUT /api/auth/password) antes de
 *     guardar la nueva, en vez de simular un setTimeout.
 *   - Sección "Notificaciones": formulario CONTROLADO con useState (req.16),
 *     sin cambios (sigue simulada porque no existe tabla de notificaciones).
 */
const DEFAULT_NOTIF: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: false,
  weeklyReport: true,
  newFollowers: true,
  postLikes: true,
  postComments: true,
};

export function UserSettings() {
  const { user, updateUsername } = useAuth();
  const { showToast } = useToast();

  // ——— Notificaciones: CONTROLADO (req.16) ———
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIF);
  const [isSavingNotif, setIsSavingNotif] = useState(false);

  async function handleSaveNotifications() {
    setIsSavingNotif(true);
    try {
      await saveNotificationSettings(notifications);
      showToast("Configuración guardada exitosamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo guardar.", "danger");
    } finally {
      setIsSavingNotif(false);
    }
  }

  // ——— Cuenta (username): NO CONTROLADO (req.17) — ref ———
  const usernameRef = useRef<HTMLInputElement>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  async function handleSaveAccount(e: FormEvent) {
    e.preventDefault();
    setAccountError(null);
    const newUsername = usernameRef.current?.value.trim() ?? "";

    if (newUsername.length < 3) {
      setAccountError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }

    // Si no cambió, no hacemos la petición
    if (newUsername === user?.username) {
      showToast("No hay cambios que guardar.", "warning");
      return;
    }

    setIsSavingAccount(true);
    try {
      await updateUsername(newUsername);
      showToast("Nombre de usuario actualizado correctamente.", "success");
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "No se pudo actualizar el usuario.");
    } finally {
      setIsSavingAccount(false);
    }
  }

  // ——— Seguridad: NO CONTROLADO (req.17) — refs ———
  const currentPwdRef = useRef<HTMLInputElement>(null);
  const newPwdRef = useRef<HTMLInputElement>(null);
  const confirmPwdRef = useRef<HTMLInputElement>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [isSavingPwd, setIsSavingPwd] = useState(false);

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwdError(null);
    const current = currentPwdRef.current?.value ?? "";
    const next = newPwdRef.current?.value ?? "";
    const confirm = confirmPwdRef.current?.value ?? "";

    if (!current) { setPwdError("Ingresa tu contraseña actual."); return; }
    if (next.length < 4) { setPwdError("La nueva contraseña debe tener al menos 4 caracteres."); return; }
    if (next !== confirm) { setPwdError("Las contraseñas no coinciden."); return; }

    setIsSavingPwd(true);
    try {
      // El backend verifica la contraseña actual contra el hash real de la BD
      // antes de permitir el cambio (401 si no coincide).
      await changePasswordRequest(current, next);
      showToast("Contraseña actualizada correctamente.", "success");
      if (currentPwdRef.current) currentPwdRef.current.value = "";
      if (newPwdRef.current) newPwdRef.current.value = "";
      if (confirmPwdRef.current) confirmPwdRef.current.value = "";
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña.");
    } finally {
      setIsSavingPwd(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Cuenta</h1>
        <p className="text-gray-600">Administra tus preferencias y privacidad</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Cuenta — formulario NO CONTROLADO (req.17) */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Cuenta</h2>
          </div>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            {accountError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{accountError}</p>
            )}
            <div>
              <label htmlFor="cfg-username" className="block font-medium text-gray-900 mb-2">Nombre de usuario</label>
              <input id="cfg-username" ref={usernameRef} type="text" defaultValue={user?.username ?? ""} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none" />
              <p className="text-sm text-gray-500 mt-1">
                Este es tu usuario para iniciar sesión. Para editar tu email o teléfono de contacto, ve a "Mi Perfil".
              </p>
            </div>
            <button type="submit" disabled={isSavingAccount} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60">
              {isSavingAccount ? "Guardando..." : "Guardar Nombre de Usuario"}
            </button>
          </form>
        </div>

        {/* Notificaciones — formulario CONTROLADO (req.16) */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            {([
              ["emailNotifications", "Notificaciones por email", "Recibir notificaciones por correo electrónico"],
              ["pushNotifications", "Notificaciones push", "Recibir notificaciones en el navegador"],
              ["weeklyReport", "Reporte semanal", "Recibir resumen de actividad semanal"],
              ["newFollowers", "Nuevos seguidores", "Notificar cuando alguien te siga"],
              ["postLikes", "Me gusta en publicaciones", "Notificar cuando te den me gusta"],
              ["postComments", "Comentarios en publicaciones", "Notificar cuando comenten tus publicaciones"],
            ] as const).map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label htmlFor={key} className="font-medium text-gray-900">{label}</label>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <input
                  id={key}
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Seguridad — formulario NO CONTROLADO (req.17) */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Seguridad</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {pwdError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwdError}</p>}
            <div>
              <label htmlFor="currentPassword" className="block font-medium text-gray-900 mb-2">Contraseña actual</label>
              <input id="currentPassword" ref={currentPwdRef} type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none" />
            </div>
            <div>
              <label htmlFor="newPassword" className="block font-medium text-gray-900 mb-2">Nueva contraseña</label>
              <input id="newPassword" ref={newPwdRef} type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block font-medium text-gray-900 mb-2">Confirmar nueva contraseña</label>
              <input id="confirmPassword" ref={confirmPwdRef} type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none" />
            </div>
            <button type="submit" disabled={isSavingPwd} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60">
              {isSavingPwd ? "Actualizando..." : "Cambiar Contraseña"}
            </button>
          </form>
        </div>

        {/* Guardar notificaciones */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleSaveNotifications}
            disabled={isSavingNotif}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            <Save className="w-5 h-5" />
            <span>{isSavingNotif ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
