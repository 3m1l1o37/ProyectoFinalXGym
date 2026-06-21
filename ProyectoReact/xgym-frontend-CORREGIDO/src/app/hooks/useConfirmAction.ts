import { useCallback } from "react";
import { useToast } from "./useToast";

interface UseConfirmActionOptions {
  message?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook personalizado avanzado: useConfirmAction
 * APORTACIÓN 2 DE REACT: Hook personalizado con useCallback
 */
export function useConfirmAction(options: UseConfirmActionOptions = {}) {
  const {
    message = "¿Estás seguro?",
    successMessage = " Acción completada",
    errorMessage = " Error en la acción",
  } = options;

  const { showToast } = useToast();

  const execute = useCallback(
    async (action: () => Promise<void>) => {
      if (!window.confirm(message)) {
        return;
      }

      try {
        await action();
        showToast(successMessage, "success");
      } catch (error) {
        showToast(errorMessage, "error");
        throw error;
      }
    },
    [message, successMessage, errorMessage, showToast]
  );

  return { execute };
}