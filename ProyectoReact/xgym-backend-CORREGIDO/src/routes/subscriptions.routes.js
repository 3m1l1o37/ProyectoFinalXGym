

const { Router } = require("express");
const ctrl = require("../controllers/subscriptions.controller");
const { verifyToken, requireRole } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", verifyToken, requireRole("admin"), ctrl.getAll);

module.exports = router;
