import { useState } from "react";
import type { FormEvent } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { getPostById, getCommentsForPost, addCommentToPost } from "../../services/api";
import type { Comment } from "../../types";
import { Spinner } from "../common/Spinner";
import { ErrorState } from "../common/ErrorState";

/**
 * UserPostDetail.tsx
 * -----------------------------------------------------------------------
 * Ruta CON PARÁMETRO (req.20a): /user/feed/:postId.
 * Muestra el post y sus comentarios; permite agregar un comentario nuevo
 * (formulario controlado, req.16). Dispara dos useFetch en paralelo.
 */
export function UserPostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const numericId = Number(postId);
  const { user } = useAuth();
  const { showToast } = useToast();

  const { data: post, status: postStatus, error: postError } = useFetch(() => getPostById(numericId), [numericId]);
  const { data: comments, status: commentsStatus, error: commentsError } = useFetch(() => getCommentsForPost(numericId), [numericId]);

  const [localComments, setLocalComments] = useState<Comment[] | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  const visibleComments = localComments ?? comments ?? [];

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    setIsSending(true);
    try {
      const created = await addCommentToPost(numericId, user?.username ?? "Miembro", trimmed);
      setLocalComments([...visibleComments, created]);
      setNewComment("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo enviar.", "danger");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to="/user" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Volver al feed
      </Link>

      {postStatus === "loading" && <Spinner label="Cargando publicación..." />}
      {postStatus === "error" && <ErrorState message={postError ?? "Error desconocido."} />}
      {postStatus === "success" && !post && <ErrorState message="Esta publicación ya no existe." />}

      {post && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
              {post.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{post.author}</h3>
              <p className="text-sm text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          <p className="text-gray-800">{post.content}</p>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Comentarios</h2>

      {commentsStatus === "loading" && <Spinner label="Cargando comentarios..." />}
      {commentsStatus === "error" && <ErrorState message={commentsError ?? "Error desconocido."} />}

      {commentsStatus === "success" && (
        <>
          {visibleComments.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 mb-4">
              Sé el primero en comentar.
            </div>
          )}
          <div className="space-y-3 mb-4">
            {visibleComments.map((c) => (
              <div key={c.id} className="bg-white rounded-lg shadow p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {c.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{c.author}</span>
                    <span className="text-xs text-gray-400">{c.timestamp}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={isSending || newComment.trim().length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
