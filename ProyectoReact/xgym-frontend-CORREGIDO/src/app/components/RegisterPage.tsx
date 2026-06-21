import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { Dumbbell, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * RegisterPage.tsx
 * -----------------------------------------------------------------------
 * Registro de nuevos usuarios (rúbrica: "Registra un usuario durante el
 * video. Revisa, logueandote con ese usuario. Mensaje de retroalimentación
 * Usuario registrado o NO").
 *
 * Demuestra:
 *  - Formulario CONTROLADO con useState (req.16)
 *  - Validación de campos (req.16)
 *  - async/await (req.13)
 *  - Estados loading / success / error (req.15)
 *  - Renderizado condicional (req.18)
 */

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  function validate(): boolean {
    // Función anidada (req.10)
    function isBlank(v: string) {
      return v.trim().length === 0;
    }
    const errors: FieldErrors = {};
    if (isBlank(username)) errors.username = "El nombre de usuario es obligatorio.";
    if (isBlank(email)) errors.email = "El correo es obligatorio.";
    else if (!email.includes("@")) errors.email = "Ingresa un correo válido.";
    if (isBlank(password)) errors.password = "La contraseña es obligatoria.";
    else if (password.length < 4) errors.password = "Mínimo 4 caracteres.";
    if (password !== confirm) errors.confirm = "Las contraseñas no coinciden.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSuccessMsg(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(username.trim(), password, email.trim());
      setSuccessMsg(` Usuario "${username.trim()}" registrado correctamente. Redirigiendo...`);
      setTimeout(() => navigate("/user", { replace: true }), 1500);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "No se pudo registrar. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-red-600 p-4 rounded-full mb-4">
            <Dumbbell className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">XGym</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta</p>
        </div>

        {/* Mensaje de éxito (req.15 — estado success) */}
        {successMsg && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700">{successMsg}</span>
          </div>
        )}

        {/* Mensaje de error de servidor (req.15 — estado error) */}
        {serverError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none ${
                fieldErrors.username ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Tu nombre de usuario"
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none ${
                fieldErrors.email ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="tu@correo.com"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none ${
                fieldErrors.password ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Mínimo 4 caracteres"
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              id="reg-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none ${
                fieldErrors.confirm ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Repite tu contraseña"
            />
            {fieldErrors.confirm && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!successMsg}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className="text-red-600 hover:text-red-700 font-medium">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
