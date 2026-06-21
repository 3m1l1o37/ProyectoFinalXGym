import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { Dumbbell, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * LoginPage.tsx — diseño ORIGINAL conservado.
 * Agregados: async login (req.13), validación de campos (req.16),
 * estados loading/error (req.15), formulario controlado (req.16).
 */
interface FieldErrors { username?: string; password?: string; }

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  /** Validación (req.10: función anidada isBlank dentro de validate). */
  function validate(): boolean {
    function isBlank(v: string) { return v.trim().length === 0; }
    const errors: FieldErrors = {};
    if (isBlank(username)) errors.username = "El usuario es obligatorio.";
    if (isBlank(password)) errors.password = "La contraseña es obligatoria.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const authUser = await login(username.trim(), password);
      navigate(authUser.role === "admin" ? "/admin" : "/user", { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
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
          <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {serverError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none ${fieldErrors.username ? "border-red-400" : "border-gray-300"}`}
              placeholder="Ingresa tu usuario"
            />
            {fieldErrors.username && <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none ${fieldErrors.password ? "border-red-400" : "border-gray-300"}`}
              placeholder="Ingresa tu contraseña"
            />
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo: <strong>admin / admin</strong> para administrador</p>
          <p className="mt-1">Usuarios semilla: nombre completo / <strong>1234</strong></p>
        </div>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">¿No tienes cuenta? </span>
          <Link to="/register" className="text-red-600 hover:text-red-700 font-medium">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
