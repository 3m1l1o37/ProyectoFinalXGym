import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ToastProvider } from "./context/ToastContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

/**
 * App.tsx — punto de composición de toda la aplicación.
 * Agrega: ErrorBoundary + 3 providers de contexto global (req.8),
 * manteniendo <RouterProvider> exactamente como en el original.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
