
const { Router } = require("express");
const ctrl = require("../controllers/members.controller");
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");
const { validateMember } = require("../middlewares/validate.middleware");

const router = Router();

// ─── Rutas protegidas (requieren token válido) ────────────────────────────────

// CONSULTA — solo admin puede ver toda la lista
router.get("/", verifyToken, requireRole("admin"), ctrl.getAll);

// CONSULTA — el propio usuario consulta su perfil; debe ir ANTES de /:id
router.get("/by-username/:username", verifyToken, ctrl.getByUsername);

// CONSULTA — admin ve el detalle de cualquier miembro
router.get("/:id", verifyToken, requireRole("admin"), ctrl.getById);

// ALTA — solo admin puede crear miembros desde el panel
router.post("/", verifyToken, requireRole("admin"), validateMember, ctrl.create);

// CAMBIO — admin puede editar cualquiera; usuario puede editar el suyo propio
// (la autorización granular está en el controlador, verificando user_id contra req.user.id)
router.put("/:id", verifyToken, validateMember, ctrl.update);

// CAMBIO — renovar o cambiar de plan (admin o el propio dueño del miembro)
router.put("/:id/renew-subscription", verifyToken, ctrl.renewSubscription);

// BAJA — solo admin puede eliminar
router.delete("/:id", verifyToken, requireRole("admin"), ctrl.remove);

module.exports = router;
