import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { NotFound } from "./components/NotFound";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { UserLayout } from "./components/user/UserLayout";
import { PageLoader } from "./components/common/PageLoader";

/**
 * routes.tsx
 * -----------------------------------------------------------------------
 * Requisito 20: Routing completo con React Router:
 *   a. Rutas con parámetros   -> /admin/users/:userId, /user/feed/:postId
 *   b. Query params           -> ?q=&status= (AdminUsers), ?tab= (Subs)
 *   c. Rutas anidadas         -> AdminLayout/UserLayout + <Outlet>
 *   d. NavLink                -> en <Sidebar> (common/Sidebar.tsx)
 *
 * Requisito 22: rutas protegidas con <ProtectedRoute>.
 * Requisito 24: error 404 con <NotFound> en path="*".
 * Requisito 25: lazy loading — cada página usa React.lazy() + <Suspense>
 *   para code-splitting real: el bundle inicial no incluye las páginas
 *   internas; se descargan al navegar a cada ruta.
 */

// ——— Lazy imports (req.25) ———
const AdminFeed = lazy(() => import("./components/admin/AdminFeed").then((m) => ({ default: m.AdminFeed })));
const AdminUsers = lazy(() => import("./components/admin/AdminUsers").then((m) => ({ default: m.AdminUsers })));
const AdminUserDetail = lazy(() => import("./components/admin/AdminUserDetail").then((m) => ({ default: m.AdminUserDetail })));
const AdminSubscriptions = lazy(() => import("./components/admin/AdminSubscriptions").then((m) => ({ default: m.AdminSubscriptions })));
const AdminSettings = lazy(() => import("./components/admin/AdminSettings").then((m) => ({ default: m.AdminSettings })));

const UserFeed = lazy(() => import("./components/user/UserFeed").then((m) => ({ default: m.UserFeed })));
const UserPostDetail = lazy(() => import("./components/user/UserPostDetail").then((m) => ({ default: m.UserPostDetail })));
const UserProfile = lazy(() => import("./components/user/UserProfile").then((m) => ({ default: m.UserProfile })));
const UserSettings = lazy(() => import("./components/user/UserSettings").then((m) => ({ default: m.UserSettings })));

function S(node: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: S(<AdminFeed />) },
      {
        path: "users",
        element: S(<AdminUsers />),
        // Ruta anidada CON PARÁMETRO (req.20a + 20c)
        children: [{ path: ":userId", element: S(<AdminUserDetail />) }],
      },
      { path: "subscriptions", element: S(<AdminSubscriptions />) },
      { path: "settings", element: S(<AdminSettings />) },
    ],
  },
  {
    path: "/user",
    element: (
      <ProtectedRoute allowedRoles={["user"]}>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: S(<UserFeed />) },
      // Ruta CON PARÁMETRO independiente (req.20a)
      { path: "feed/:postId", element: S(<UserPostDetail />) },
      { path: "profile", element: S(<UserProfile />) },
      { path: "settings", element: S(<UserSettings />) },
    ],
  },
  {
    // Error 404 (req.24): en lugar del <Navigate to="/" replace /> original
    path: "*",
    element: <NotFound />,
  },
]);
