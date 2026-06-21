
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const membersRoutes = require("./routes/members.routes");
const postsRoutes = require("./routes/posts.routes");
const subscriptionsRoutes = require("./routes/subscriptions.routes");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middlewares globales ─────────────────────────────────────────────────────

// CORS: permite peticiones solo desde el frontend configurado en .env
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parsear JSON en el body de las peticiones
app.use(express.json());

// Logger simple de peticiones (útil para mostrar en el video de la rúbrica)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Rutas ────────────────────────────────────────────────────────────────────
// Prefijo /api para todas las rutas del backend.

app.use("/api/auth", authRoutes);           // POST /api/auth/register, /api/auth/login
app.use("/api/members", membersRoutes);     // CRUD de miembros
app.use("/api/posts", postsRoutes);         // CRUD de posts y comentarios
app.use("/api/subscriptions", subscriptionsRoutes); // GET suscripciones

// ─── Ruta de salud (health check) ────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, message: "XGym API funcionando correctamente 🏋️" });
});

// ─── Ruta no encontrada (404) ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada." });
});

// ─── Manejador global de errores ─────────────────────────────────────────────
// Captura errores no manejados en los controladores
app.use((err, _req, res, _next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ ok: false, message: "Error interno del servidor." });
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 XGym API corriendo en http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
