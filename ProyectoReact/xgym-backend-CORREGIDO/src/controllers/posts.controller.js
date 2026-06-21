/**
 * src/controllers/posts.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * CRUD de publicaciones del feed (posts y comentarios).
 */

const pool = require("../config/db");

/** GET /api/posts — Lista todos los posts (más recientes primero). */
async function getAll(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.content, p.likes, p.timestamp,
              u.username AS author,
              UPPER(LEFT(u.username, 2)) AS avatar,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments,
              0 AS isLiked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    return res.status(200).json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error en getAll posts:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener publicaciones." });
  }
}

/** GET /api/posts/:id — Obtiene un post por ID. */
async function getById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.content, p.likes, p.timestamp,
              u.username AS author,
              UPPER(LEFT(u.username, 2)) AS avatar,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments,
              0 AS isLiked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Publicación no encontrada." });
    }
    return res.status(200).json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("Error en getById post:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener la publicación." });
  }
}

/** POST /api/posts — Crea una nueva publicación. */
async function create(req, res) {
  const { content } = req.body;
  const userId = req.user.id; // viene del JWT (verifyToken)

  try {
    const now = new Date();
    const timestamp = "Justo ahora";

    const [result] = await pool.query(
      "INSERT INTO posts (user_id, content, likes, timestamp, created_at) VALUES (?, ?, 0, ?, ?)",
      [userId, content.trim(), timestamp, now]
    );

    const [newPost] = await pool.query(
      `SELECT p.id, p.content, p.likes, p.timestamp,
              u.username AS author,
              UPPER(LEFT(u.username, 2)) AS avatar,
              0 AS comments, 0 AS isLiked
       FROM posts p JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ ok: true, message: "Publicación creada.", data: newPost[0] });
  } catch (err) {
    console.error("Error en create post:", err);
    return res.status(500).json({ ok: false, message: "Error al crear la publicación." });
  }
}

/** DELETE /api/posts/:id — Elimina un post (solo admin o autor). */
async function remove(req, res) {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  try {
    const [existing] = await pool.query("SELECT id, user_id FROM posts WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, message: "Publicación no encontrada." });
    }

    // Solo el autor o un admin pueden borrar
    if (role !== "admin" && existing[0].user_id !== userId) {
      return res.status(403).json({ ok: false, message: "No tienes permiso para eliminar esta publicación." });
    }

    await pool.query("DELETE FROM posts WHERE id = ?", [id]);
    return res.status(200).json({ ok: true, message: "Publicación eliminada.", data: { id: Number(id) } });
  } catch (err) {
    console.error("Error en remove post:", err);
    return res.status(500).json({ ok: false, message: "Error al eliminar la publicación." });
  }
}

/** POST /api/posts/:id/like — Alterna like en un post. */
async function toggleLike(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT id, likes FROM posts WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Publicación no encontrada." });
    }

    // Toggle simple: incrementa o decrementa según el estado actual
    // En producción real usaría una tabla post_likes para rastrear por usuario
    const newLikes = rows[0].likes + 1;
    await pool.query("UPDATE posts SET likes = ? WHERE id = ?", [newLikes, id]);

    return res.status(200).json({ ok: true, data: { id: Number(id), likes: newLikes } });
  } catch (err) {
    console.error("Error en toggleLike:", err);
    return res.status(500).json({ ok: false, message: "Error al procesar el like." });
  }
}

/** GET /api/posts/:id/comments — Lista comentarios de un post. */
async function getComments(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.content, c.timestamp,
              u.username AS author
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    );
    return res.status(200).json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error en getComments:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener comentarios." });
  }
}

/** POST /api/posts/:id/comments — Agrega un comentario a un post. */
async function addComment(req, res) {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    if (!content || content.trim().length < 1) {
      return res.status(400).json({ ok: false, message: "El comentario no puede estar vacío." });
    }

    const now = new Date();
    const [result] = await pool.query(
      "INSERT INTO comments (post_id, user_id, content, timestamp, created_at) VALUES (?, ?, ?, 'Justo ahora', ?)",
      [id, userId, content.trim(), now]
    );

    const [newComment] = await pool.query(
      `SELECT c.id, c.content, c.timestamp, u.username AS author
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    // Actualizar contador de comentarios en el post
    await pool.query("UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?", [id]);

    return res.status(201).json({ ok: true, data: newComment[0] });
  } catch (err) {
    console.error("Error en addComment:", err);
    return res.status(500).json({ ok: false, message: "Error al agregar comentario." });
  }
}

module.exports = { getAll, getById, create, remove, toggleLike, getComments, addComment };
