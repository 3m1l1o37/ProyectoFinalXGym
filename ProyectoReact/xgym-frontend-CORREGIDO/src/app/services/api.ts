/**
 * services/api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Capa de acceso al backend Node.js/Express.
 * Todas las funciones usan fetch() + async/await y manejan los 3 estados:
 * loading (quien llama), success (resolve), error (reject/throw).
 *
 * RÚBRICA:
 *  - Manejo de consumo de APIs con fetch (req.14)
 *  - Manejo de promesas (req.12)
 *  - async/await (req.13)
 *  - Estados loading/success/error (req.15)
 */

import type {
  AuthUser,
  Comment,
  FeedSettings,
  Member,
  NotificationSettings,
  Post,
  Subscription,
} from "../types";

// URL base del backend. En desarrollo apunta a localhost:4000.
// En producción reemplaza con la URL de tu hosting.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// ─── Token helpers ────────────────────────────────────────────────────────────

function getToken(): string | null {
  return window.localStorage.getItem("token");
}

function saveToken(token: string) {
  window.localStorage.setItem("token", token);
}

function clearToken() {
  window.localStorage.removeItem("token");
}

/** Construye los headers comunes para las peticiones autenticadas. */
function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Helper genérico: hace fetch y lanza el mensaje de error del backend si falla. */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? "Error de conexión con el servidor.");
  }

  return json.data ?? json;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginRequest(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Error al iniciar sesión.");

  saveToken(data.token);
  return data.user as AuthUser;
}

export async function registerRequest(
  username: string,
  password: string,
  email: string
): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Error al registrar usuario.");

  saveToken(data.token);
  return data.user as AuthUser;
}

/** Cambia el username del usuario autenticado. Requiere token (ya incluido por authHeaders). */
export async function changeUsernameRequest(newUsername: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/username`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ newUsername }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Error al cambiar el nombre de usuario.");

  // El backend devuelve un token nuevo porque el username viejo queda obsoleto en el payload
  saveToken(data.token);
  return data.user as AuthUser;
}

/** Cambia la contraseña del usuario autenticado. Exige la contraseña actual real. */
export async function changePasswordRequest(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Error al cambiar la contraseña.");

  return { message: data.message };
}

export function logoutCleanup() {
  clearToken();
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function getMembers(): Promise<Member[]> {
  return apiFetch<Member[]>("/members");
}

export async function getMemberById(id: number): Promise<Member | undefined> {
  try {
    return await apiFetch<Member>(`/members/${id}`);
  } catch {
    return undefined;
  }
}

export async function getMemberByUsername(username: string): Promise<Member> {
  return apiFetch<Member>(`/members/by-username/${encodeURIComponent(username)}`);
}

export async function createMember(data: Omit<Member, "id">): Promise<Member> {
  return apiFetch<Member>("/members", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMemberById(id: number, data: Partial<Member>): Promise<Member> {
  return apiFetch<Member>(`/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMember(id: number): Promise<{ id: number }> {
  return apiFetch<{ id: number }>(`/members/${id}`, { method: "DELETE" });
}

/** Renueva o cambia el plan de un miembro. Admin: cualquier miembro. Usuario: solo el suyo. */
export async function renewSubscriptionRequest(memberId: number, plan: string): Promise<Member> {
  return apiFetch<Member>(`/members/${memberId}/renew-subscription`, {
    method: "PUT",
    body: JSON.stringify({ plan }),
  });
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(): Promise<Post[]> {
  return apiFetch<Post[]>("/posts");
}

export async function getPostById(postId: number): Promise<Post | undefined> {
  try {
    return await apiFetch<Post>(`/posts/${postId}`);
  } catch {
    return undefined;
  }
}

export async function createPost(content: string, _author: string): Promise<Post> {
  return apiFetch<Post>("/posts", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function deletePostRequest(postId: number): Promise<{ id: number }> {
  return apiFetch<{ id: number }>(`/posts/${postId}`, { method: "DELETE" });
}

export async function toggleLikeRequest(postId: number): Promise<Post> {
  const result = await apiFetch<{ id: number; likes: number }>(`/posts/${postId}/like`, {
    method: "POST",
  });
  // Devolvemos un Post parcial suficiente para que el frontend actualice el estado
  return { id: result.id, likes: result.likes } as Post;
}

export async function getCommentsForPost(postId: number): Promise<Comment[]> {
  return apiFetch<Comment[]>(`/posts/${postId}/comments`);
}

export async function addCommentToPost(
  postId: number,
  _author: string,
  content: string
): Promise<Comment> {
  return apiFetch<Comment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscriptions(): Promise<Subscription[]> {
  return apiFetch<Subscription[]>("/subscriptions");
}

// ─── Settings de feed/notificaciones (simuladas — no tienen tabla en BD) ──────
// El cambio de username y password SÍ son reales: ver changeUsernameRequest
// y changePasswordRequest en la sección de Auth, arriba.

export async function saveFeedSettings(settings: FeedSettings): Promise<FeedSettings> {
  return new Promise((resolve) => setTimeout(() => resolve(settings), 500));
}

export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<NotificationSettings> {
  return new Promise((resolve) => setTimeout(() => resolve(settings), 500));
}
