/**
 * Tipos centrales de la aplicación XGym.
 *
 * Requisito 4 (PropTypes y/o TypeScript): se usa TypeScript como mecanismo
 * de validación y tipado de props y datos en todo el proyecto. Cada
 * componente declara su propia interfaz de props (ver comentarios "Props"
 * dentro de cada archivo .tsx).
 */

export type Role = "admin" | "user";

/** Usuario autenticado, guardado en el contexto global de auth. */
export interface AuthUser {
  username: string;
  role: Role;
}

/** Estado genérico para peticiones asíncronas. */
export type RequestStatus = "idle" | "loading" | "success" | "error";

export interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  subscriptionType: string;
  status: "active" | "inactive";
  totalVisits: number;
  currentStreak: number;
  personalRecords: number;
}

export interface Subscription {
  id: number;
  userName: string;
  plan: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  amount: string;
}

export interface FeedSettings {
  allowComments: boolean;
  allowLikes: boolean;
  allowSharing: boolean;
  moderateComments: boolean;
  notifyNewPosts: boolean;
  autoApprove: boolean;
  maxPostLength: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
  newFollowers: boolean;
  postLikes: boolean;
  postComments: boolean;
}

export type Variant = "success" | "warning" | "danger" | "info" | "neutral";

/** Notificación tipo "toast", mostrada vía Portal. */
export interface ToastMessage {
  id: number;
  message: string;
  variant: Variant;
}
