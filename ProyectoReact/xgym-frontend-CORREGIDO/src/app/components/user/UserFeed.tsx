import { useState } from "react";
import { Link } from "react-router";
import { Heart, MessageCircle, Share2, Plus } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../hooks/useToast";
import { useSettings } from "../../hooks/useSettings";
import { useAuth } from "../../hooks/useAuth";
import { getPosts, toggleLikeRequest } from "../../services/api";
import type { Post } from "../../types";
import { Spinner } from "../common/Spinner";
import { ErrorState } from "../common/ErrorState";
import { CreatePostModal } from "../common/CreatePostModal";
import { MotivationalQuote } from "../common/MotivationalQuote";

/**
 * UserFeed.tsx — diseño ORIGINAL conservado.
 * Cambios: datos reales con useFetch, like real contra API (req.13/15),
 * modal crear publicación, enlace al detalle de post con comentarios
 * (/user/feed/:postId, req.20a), frase motivacional con API real (req.14).
 */
export function UserFeed() {
  const { data: posts, status, error, refetch } = useFetch(() => getPosts(), []);
  const { showToast } = useToast();
  const { settings } = useSettings();
  const { user } = useAuth();

  const [localPosts, setLocalPosts] = useState<Post[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likingId, setLikingId] = useState<number | null>(null);

  const visiblePosts = localPosts ?? posts ?? [];

  async function handleLike(postId: number) {
    setLikingId(postId);
    try {
      const updated = await toggleLikeRequest(postId);
      setLocalPosts(visiblePosts.map((p) => (p.id === postId ? updated : p)));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo procesar el like.", "danger");
    } finally {
      setLikingId(null);
    }
  }

  function handlePostCreated(newPost: Post) {
    setLocalPosts([newPost, ...visiblePosts]);
    setIsModalOpen(false);
    showToast("¡Tu publicación ya es visible para la comunidad!", "success");
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feed Comunitario</h1>
        <p className="text-gray-600">Conecta con otros miembros de XGym</p>
      </div>

      {/* Frase del día — API externa real (req.14) */}
      <MotivationalQuote />

      {/* Botón abrir modal de publicación */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-3 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>¿Qué estás entrenando hoy?</span>
      </button>

      {/* Renderizado condicional (req.18) */}
      {status === "loading" && <Spinner label="Cargando publicaciones..." />}
      {status === "error" && <ErrorState message={error ?? "Error desconocido."} onRetry={refetch} />}

      {/* Renderizado de lista (req.19) */}
      {status === "success" && (
        <div className="space-y-6">
          {visiblePosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  {post.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.author}</h3>
                  <p className="text-sm text-gray-500">{post.timestamp}</p>
                </div>
              </div>

              <p className="text-gray-800 mb-4">{post.content}</p>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleLike(post.id)}
                  disabled={likingId === post.id}
                  className={`flex items-center gap-2 transition-colors disabled:opacity-50 ${post.isLiked ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                  <span>{post.likes}</span>
                </button>
                {/* Enlace a detalle con comentarios — ruta con parámetro (req.20a) */}
                <Link
                  to={`/user/feed/${post.id}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments}</span>
                </Link>
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
        author={user?.username ?? "Miembro XGym"}
      />
    </div>
  );
}
