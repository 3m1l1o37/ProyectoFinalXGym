
const jwt = require("jsonwebtoken");

/**
 * verifyToken — middleware de AUTENTICACIÓN.
 * Lee el token del header Authorization, lo verifica con JWT_SECRET y
 * adjunta el payload decodificado a `req.user`.
 * Si el token falta o es inválido, responde 401 Unauthorized.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // El header debe tener el formato: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      message: "Acceso denegado. Se requiere token de autenticación.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, username, role, iat, exp }
    next();
  } catch (err) {
    // Token expirado o firma inválida
    return res.status(401).json({
      ok: false,
      message: "Token inválido o expirado. Inicia sesión nuevamente.",
    });
  }
}

/**
 * requireRole — middleware de AUTORIZACIÓN (factory function).
 * Recibe uno o varios roles permitidos y devuelve un middleware que
 * verifica que req.user.role esté en esa lista.
 * Se usa DESPUÉS de verifyToken.
 *
 * Ejemplo de uso:
 *   router.delete("/members/:id", verifyToken, requireRole("admin"), ...)
 */
function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: `Acceso prohibido. Se requiere rol: ${roles.join(" o ")}.`,
      });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
