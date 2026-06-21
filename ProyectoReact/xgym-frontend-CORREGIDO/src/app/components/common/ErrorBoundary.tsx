import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * components/common/ErrorBoundary.tsx
 * -----------------------------------------------------------------------
 * Los "Error Boundaries" son la única forma en React de capturar errores
 * de renderizado en el árbol de componentes (`componentDidCatch`), algo
 * que NO se puede lograr con hooks. Por eso este es el único componente
 * de clase del proyecto: es un caso de uso legítimo donde la API de
 * clases sigue siendo necesaria en React. Envuelve <RouterProvider /> en
 * App.tsx para evitar que un error en cualquier página deje a toda la
 * aplicación en una pantalla blanca.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary atrapó un error:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: null });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
            <p className="text-gray-600 mb-6">{this.state.errorMessage ?? "Ocurrió un error inesperado en la aplicación."}</p>
            <button onClick={this.handleReload} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
