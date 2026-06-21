

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/**
 * POST /api/auth/register
 * Crea un nuevo usuario con contraseña hasheada y devuelve JWT + datos básicos.
 */
async function register(req, res) {
  const { username, password, email } = req.body;

  try {
    // 1. Verificar que el username no exista ya
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        ok: false,
        message: "El nombre de usuario ya está en uso. Elige otro.",
      });
    }

    // 2. Hashear la contraseña con bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertar usuario en la tabla users
    const today = new Date().toISOString().split("T")[0];
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, member_since)
       VALUES (?, ?, ?, 'user', ?)`,
      [username.trim(), email.trim(), hashedPassword, today]
    );

    const newUserId = result.insertId;

    // 4. Insertar también en la tabla members para que aparezca en el panel admin
    await pool.query(
      `INSERT INTO members (user_id, name, email, phone, member_since, subscription_type, status, total_visits, current_streak, personal_records)
       VALUES (?, ?, ?, '—', ?, 'Básico', 'active', 0, 0, 0)`,
      [newUserId, username.trim(), email.trim(), today]
    );

    // 5. Firmar el JWT con payload: id, username, role
    const token = jwt.sign(
      { id: newUserId, username: username.trim(), role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    // 6. Responder 201 Created con el token y datos del usuario
    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente.",
      token,
      user: { id: newUserId, username: username.trim(), role: "user" },
    });
  } catch (err) {
    console.error("Error en register:", err);
    return res.status(500).json({ ok: false, message: "Error interno del servidor." });
  }
}

/**
 * POST /api/auth/login
 * Valida credenciales y devuelve JWT + datos del usuario.
 */
async function login(req, res) {
  const { username, password } = req.body;

  try {
    // 1. Buscar el usuario por username
    const [rows] = await pool.query(
      "SELECT id, username, email, role, password_hash FROM users WHERE username = ?",
      [username.trim()]
    );

    if (rows.length === 0) {
      // 401 con mensaje genérico (no revelar si existe o no el usuario)
      return res.status(401).json({ ok: false, message: "Usuario o contraseña incorrectos." });
    }

    const user = rows[0];

    // 2. Comparar la contraseña ingresada con el hash almacenado
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ ok: false, message: "Usuario o contraseña incorrectos." });
    }

    // 3. Firmar el JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    // 4. Responder 200 OK
    return res.status(200).json({
      ok: true,
      message: "Inicio de sesión exitoso.",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ ok: false, message: "Error interno del servidor." });
  }
}

/**
 * PUT /api/auth/username
 * Cambia el username del usuario autenticado. Requiere JWT válido.
 * Devuelve un nuevo token porque el username viejo queda obsoleto en el payload.
 */
async function changeUsername(req, res) {
  const userId = req.user.id; // viene del middleware de auth (JWT decodificado)
  const { newUsername } = req.body;

  if (!newUsername || !newUsername.trim()) {
    return res.status(400).json({ ok: false, message: "El nuevo nombre de usuario es obligatorio." });
  }

  const cleanUsername = newUsername.trim();

  try {
    // 1. Verificar que el nuevo username no esté en uso por otra cuenta
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ? AND id != ?",
      [cleanUsername, userId]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        ok: false,
        message: "Ese nombre de usuario ya está en uso. Elige otro.",
      });
    }

    // 2. Actualizar en la tabla users
    await pool.query("UPDATE users SET username = ? WHERE id = ?", [cleanUsername, userId]);

    // 3. Obtener el rol actual para incluirlo en el nuevo token
    //    (no se modifica members.name: el nombre visible en "Mi Perfil" es un
    //    dato de contacto independiente del username, igual que email/teléfono)
    const [userRows] = await pool.query("SELECT role FROM users WHERE id = ?", [userId]);
    const role = userRows[0]?.role || "user";

    // 4. Firmar un nuevo token con el username actualizado
    const token = jwt.sign(
      { id: userId, username: cleanUsername, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    return res.status(200).json({
      ok: true,
      message: "Nombre de usuario actualizado correctamente.",
      token,
      user: { id: userId, username: cleanUsername, role },
    });
  } catch (err) {
    console.error("Error en changeUsername:", err);
    return res.status(500).json({ ok: false, message: "Error interno del servidor." });
  }
}

/**
 * PUT /api/auth/password
 * Cambia la contraseña del usuario autenticado.
 * Exige la contraseña ACTUAL correcta antes de permitir el cambio.
 */
async function changePassword(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      ok: false,
      message: "Debes indicar la contraseña actual y la nueva contraseña.",
    });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({
      ok: false,
      message: "La nueva contraseña debe tener al menos 4 caracteres.",
    });
  }

  try {
    // 1. Traer el hash actual desde la BD
    const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado." });
    }

    // 2. Verificar que la contraseña actual ingresada coincide con la real de la BD
    const matches = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!matches) {
      return res.status(401).json({ ok: false, message: "La contraseña actual no es correcta." });
    }

    // 3. Hashear y guardar la nueva contraseña
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, userId]);

    return res.status(200).json({ ok: true, message: "Contraseña actualizada correctamente." });
  } catch (err) {
    console.error("Error en changePassword:", err);
    return res.status(500).json({ ok: false, message: "Error interno del servidor." });
  }
}

module.exports = { register, login, changeUsername, changePassword };
