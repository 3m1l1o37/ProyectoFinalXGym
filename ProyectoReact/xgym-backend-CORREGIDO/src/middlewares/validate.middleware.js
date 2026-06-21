
/**
 * validateLogin — valida el body de POST /api/auth/login
 */
function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({ ok: false, message: "El campo 'username' es obligatorio." });
  }
  if (!password || typeof password !== "string" || password.trim() === "") {
    return res.status(400).json({ ok: false, message: "El campo 'password' es obligatorio." });
  }

  next();
}

/**
 * validateRegister — valida el body de POST /api/auth/register
 */
function validateRegister(req, res, next) {
  const { username, password, email } = req.body;

  if (!username || username.trim().length < 3) {
    return res.status(400).json({ ok: false, message: "El nombre de usuario debe tener al menos 3 caracteres." });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, message: "El correo electrónico no es válido." });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ ok: false, message: "La contraseña debe tener al menos 4 caracteres." });
  }

  next();
}

/**
 * validateMember — valida el body de POST y PUT /api/members
 */
function validateMember(req, res, next) {
  const { name, email, phone } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ ok: false, message: "El nombre debe tener al menos 2 caracteres." });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, message: "El correo electrónico no es válido." });
  }
  if (!phone || phone.trim().length < 7) {
    return res.status(400).json({ ok: false, message: "El teléfono debe tener al menos 7 caracteres." });
  }

  next();
}

/**
 * validatePost — valida el body de POST /api/posts
 */
function validatePost(req, res, next) {
  const { content } = req.body;

  if (!content || content.trim().length < 3) {
    return res.status(400).json({ ok: false, message: "El contenido de la publicación es obligatorio (mínimo 3 caracteres)." });
  }
  if (content.length > 500) {
    return res.status(400).json({ ok: false, message: "El contenido no puede superar 500 caracteres." });
  }

  next();
}

module.exports = { validateLogin, validateRegister, validateMember, validatePost };
