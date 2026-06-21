import { useState } from "react";
import { Heart, MessageCircle, Share2, Plus, Trash2 } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../hooks/useToast";
import { useSettings } from "../../hooks/useSettings";
import { useAuth } from "../../hooks/useAuth";
import { getPosts, deletePostRequest } from "../../services/api";
import type { Post } from "../../types";
import { Spinner } from "../common/Spinner";
import { ErrorState } from "../common/ErrorState";
import { CreatePostModal } from "../common/CreatePostModal";
import { MotivationalQuote } from "../common/MotivationalQuote";

/**
 * AdminFeed.tsx — diseño ORIGINAL conservado.
 * Cambios: datos reales con useFetch (req.12/13/15), borrar post,
 * modal de crear publicación (req.16), frase motivacional con API real
 * (req.14), renderizado condicional (req.18), lista dinámica (req.19).
 */
export function AdminFeed() {
  const { data: posts, status, error, refetch } = useFetch(() => getPosts(), []);
  const { showToast } = useToast();
  const { settings } = useSettings();
  const { user } = useAuth();

  const [localPosts, setLocalPosts] = useState<Post[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const visiblePosts = localPosts ?? posts ?? [];

  async function handleDelete(postId: number) {
    try {
      await deletePostRequest(postId);
      setLocalPosts(visiblePosts.filter((p) => p.id !== postId));
      showToast("Publicación eliminada.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo eliminar.", "danger");
    }
  }

  function handlePostCreated(newPost: Post) {
    setLocalPosts([newPost, ...visiblePosts]);
    setIsModalOpen(false);
    showToast("Publicación creada exitosamente.", "success");
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feed Comunitario</h1>
        <p className="text-gray-600">Actividad reciente de los miembros de XGym</p>
      </div>

      {/* Frase del día — API externa real (req.14) */}
      <MotivationalQuote />

      {/* Botón crear publicación */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-3 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Crear nueva publicación</span>
      </button>

      {/* Renderizado condicional (req.18) */}
      {status === "loading" && <Spinner label="Cargando publicaciones..." />}
      {status === "error" && <ErrorState message={error ?? "Error desconocido."} onRetry={refetch} />}

      {/* Renderizado de listas (req.19) */}
      {status === "success" && (
        <div className="space-y-6">
          {visiblePosts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Aún no hay publicaciones.
            </div>
          )}
          {visiblePosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    {post.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Eliminar publicación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-gray-800 mb-4">{post.content}</p>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handlePostCreated}
        maxLength={settings.maxPostLength}
        author={user?.username ?? "Administración XGym"}
      />
    </div>
  );
}
