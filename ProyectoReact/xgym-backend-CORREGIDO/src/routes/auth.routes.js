
const { Router } = require("express");
const { register, login, changeUsername, changePassword } = require("../controllers/auth.controller");
const { validateRegister, validateLogin } = require("../middlewares/validate.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = Router();

// Middleware de validación ANTES del controlador (pipeline: validar → controlar)
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Rutas protegidas: requieren JWT válido (verifyToken adjunta req.user)
router.put("/username", verifyToken, changeUsername);
router.put("/password", verifyToken, changePassword);

module.exports = router;
