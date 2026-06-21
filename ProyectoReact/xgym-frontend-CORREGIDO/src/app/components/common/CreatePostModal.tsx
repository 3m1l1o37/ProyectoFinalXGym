import { useState } from "react";
import type { FormEvent } from "react";
import { createPost } from "../../services/api";
import type { Post } from "../../types";
import { useToast } from "../../hooks/useToast";
import { Modal } from "./Modal";

/**
 * components/common/CreatePostModal.tsx
 * -----------------------------------------------------------------------
 * Formulario CONTROLADO (requisito 16), reutilizado por AdminFeed y
 * UserFeed mediante props (author, maxLength). Se abre desde el botón
 * "Crear nueva publicación" / "¿Qué estás entrenando hoy?" que ya
 * existía en el diseño original, pero que antes no tenía ninguna acción
 * asociada.
 */
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (post: Post) => void;
  maxLength: number;
  author: string;
}

export function CreatePostModal({ isOpen, onClose, onCreated, maxLength, author }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const remainingChars = maxLength - content.length;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();

    if (trimmed.length === 0) {
      setValidationError("Escribe algo antes de publicar.");
      return;
    }
    if (trimmed.length > maxLength) {
      setValidationError(`La publicación supera el límite de ${maxLength} caracteres.`);
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    try {
      const newPost = await createPost(trimmed, author);
      setContent("");
      onCreated(newPost);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo publicar.", "danger");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setContent("");
    setValidationError(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear nueva publicación">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          placeholder="¿Qué quieres compartir con la comunidad?"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none resize-none ${
            validationError ? "border-red-400" : "border-gray-300"
          }`}
        />
        <div className="flex items-center justify-between text-sm">
          <span className={remainingChars < 0 ? "text-red-600" : "text-gray-500"}>{remainingChars} caracteres restantes</span>
          {validationError && <span className="text-red-600">{validationError}</span>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
