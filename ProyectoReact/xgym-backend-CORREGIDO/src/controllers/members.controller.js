
const pool = require("../config/db");

/**
 * GET /api/members
 * CONSULTA — Lista todos los miembros.
 * Accesible solo para admin (protegida con verifyToken + requireRole).
 */
async function getAll(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, member_since AS memberSince,
              subscription_type AS subscriptionType, status,
              total_visits AS totalVisits, current_streak AS currentStreak,
              personal_records AS personalRecords
       FROM members
       ORDER BY id ASC`
    );
    return res.status(200).json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error en getAll members:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener miembros." });
  }
}

/**
 * GET /api/members/:id
 * CONSULTA — Obtiene un miembro por ID.
  */
async function getById(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, member_since AS memberSince,
              subscription_type AS subscriptionType, status,
              total_visits AS totalVisits, current_streak AS currentStreak,
              personal_records AS personalRecords
       FROM members WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Miembro no encontrado." });
    }

    return res.status(200).json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("Error en getById:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener el miembro." });
  }
}

/**
 * GET /api/members/by-username/:username
 * CONSULTA — Busca el miembro que corresponde al usuario logueado.
 * Usado por el perfil del usuario normal.
 */
async function getByUsername(req, res) {
  const { username } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT m.id, m.name, m.email, m.phone,
              m.member_since AS memberSince,
              m.subscription_type AS subscriptionType, m.status,
              m.total_visits AS totalVisits, m.current_streak AS currentStreak,
              m.personal_records AS personalRecords
       FROM members m
       JOIN users u ON m.user_id = u.id
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) {
      // Si no tiene miembro asociado, devuelve un perfil vacío en vez de 404
      return res.status(200).json({
        ok: true,
        data: {
          id: 0, name: username, email: "", phone: "",
          memberSince: "", subscriptionType: "Básico",
          status: "active", totalVisits: 0, currentStreak: 0, personalRecords: 0,
        },
      });
    }

    return res.status(200).json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("Error en getByUsername:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener el perfil." });
  }
}

/**
 * POST /api/members
 * ALTA — Crea un nuevo miembro (admin only).
 */
async function create(req, res) {
  const { name, email, phone, subscriptionType = "Básico", status = "active" } = req.body;

  try {
    const today = new Date().toISOString().split("T")[0];
    const [result] = await pool.query(
      `INSERT INTO members (name, email, phone, member_since, subscription_type, status,
                            total_visits, current_streak, personal_records)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0)`,
      [name.trim(), email.trim(), phone.trim(), today, subscriptionType, status]
    );

    const [newMember] = await pool.query(
      `SELECT id, name, email, phone, member_since AS memberSince,
              subscription_type AS subscriptionType, status,
              total_visits AS totalVisits, current_streak AS currentStreak,
              personal_records AS personalRecords
       FROM members WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      message: "Miembro creado correctamente.",
      data: newMember[0],
    });
  } catch (err) {
    console.error("Error en create member:", err);
    return res.status(500).json({ ok: false, message: "Error al crear el miembro." });
  }
}

/**
 * PUT /api/members/:id
 * CAMBIO — Actualiza los datos de un miembro (admin o el propio usuario).
 *
 * SEGURIDAD: si quien llama NO es admin, solo puede editar el miembro que
 * está ligado a su propio user_id (no puede editar el perfil de otro usuario
 * simplemente cambiando el :id en la URL).
 */
async function update(req, res) {
  const { id } = req.params;
  const { name, email, phone, subscriptionType, status } = req.body;

  try {
    // Verificar que existe y obtener su user_id para el check de ownership
    const [existing] = await pool.query("SELECT id, user_id FROM members WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, message: "Miembro no encontrado." });
    }

    // Si no es admin, solo puede editar su propio registro de miembro
    const isAdmin = req.user.role === "admin";
    const isOwner = existing[0].user_id === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para editar el perfil de otro miembro.",
      });
    }

    // Un usuario normal (no admin) no puede cambiarse el plan o el estado por su cuenta
    // libremente vía este endpoint; eso pasa por /api/members/:id/renew-subscription
    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push("name = ?"); values.push(name.trim()); }
    if (email !== undefined) { fields.push("email = ?"); values.push(email.trim()); }
    if (phone !== undefined) { fields.push("phone = ?"); values.push(phone.trim()); }
    if (isAdmin && subscriptionType !== undefined) { fields.push("subscription_type = ?"); values.push(subscriptionType); }
    if (isAdmin && status !== undefined) { fields.push("status = ?"); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ ok: false, message: "No se enviaron campos para actualizar." });
    }

    values.push(id);
    await pool.query(`UPDATE members SET ${fields.join(", ")} WHERE id = ?`, values);

    // Devolver el registro actualizado
    const [updated] = await pool.query(
      `SELECT id, name, email, phone, member_since AS memberSince,
              subscription_type AS subscriptionType, status,
              total_visits AS totalVisits, current_streak AS currentStreak,
              personal_records AS personalRecords
       FROM members WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      ok: true,
      message: "Miembro actualizado correctamente.",
      data: updated[0],
    });
  } catch (err) {
    console.error("Error en update member:", err);
    return res.status(500).json({ ok: false, message: "Error al actualizar el miembro." });
  }
}

/**
 * PUT /api/members/:id/renew-subscription
 * CAMBIO — Renueva o cambia el plan de un miembro.
 * Permitido para admin (cualquier miembro) o para el propio usuario (su plan).
 *
 * Actualiza members.subscription_type Y crea un nuevo registro histórico
 * en la tabla subscriptions con fechas de inicio/fin y monto.
 */
const PLAN_PRICES = {
  "Básico": "39€",
  "Mensual": "49€",
  "Premium": "59€",
  "Premium Trimestral": "169€",
  "Premium Anual": "599€",
};

async function renewSubscription(req, res) {
  const { id } = req.params;
  const { plan } = req.body;

  if (!plan || !plan.trim()) {
    return res.status(400).json({ ok: false, message: "Debes indicar el plan." });
  }

  try {
    const [existing] = await pool.query("SELECT id, user_id FROM members WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, message: "Miembro no encontrado." });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = existing[0].user_id === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para cambiar el plan de otro miembro.",
      });
    }

    const cleanPlan = plan.trim();
    const amount = PLAN_PRICES[cleanPlan] || "0€";

    // Calcular fechas: inicia hoy, termina en 1 mes (regla simple; ajustable según el plan)
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (cleanPlan.includes("Anual")) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (cleanPlan.includes("Trimestral")) {
      endDate.setMonth(endDate.getMonth() + 3);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const fmt = (d) => d.toISOString().split("T")[0];

    // 1. Actualizar el plan vigente en members
    await pool.query(
      "UPDATE members SET subscription_type = ?, status = 'active' WHERE id = ?",
      [cleanPlan, id]
    );

    // 2. Insertar el nuevo registro histórico en subscriptions
    await pool.query(
      `INSERT INTO subscriptions (member_id, plan, start_date, end_date, amount)
       VALUES (?, ?, ?, ?, ?)`,
      [id, cleanPlan, fmt(startDate), fmt(endDate), amount]
    );

    const [updated] = await pool.query(
      `SELECT id, name, email, phone, member_since AS memberSince,
              subscription_type AS subscriptionType, status,
              total_visits AS totalVisits, current_streak AS currentStreak,
              personal_records AS personalRecords
       FROM members WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      ok: true,
      message: `Plan actualizado a "${cleanPlan}" correctamente.`,
      data: updated[0],
    });
  } catch (err) {
    console.error("Error en renewSubscription:", err);
    return res.status(500).json({ ok: false, message: "Error al renovar la suscripción." });
  }
}

/**
 * DELETE /api/members/:id
 * BAJA — Elimina un miembro (admin only).
 */
async function remove(req, res) {
  const { id } = req.params;

  try {
    const [existing] = await pool.query("SELECT id, name FROM members WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, message: "Miembro no encontrado." });
    }

    await pool.query("DELETE FROM members WHERE id = ?", [id]);

    return res.status(200).json({
      ok: true,
      message: `Miembro "${existing[0].name}" eliminado correctamente.`,
      data: { id: Number(id) },
    });
  } catch (err) {
    console.error("Error en remove member:", err);
    return res.status(500).json({ ok: false, message: "Error al eliminar el miembro." });
  }
}

module.exports = { getAll, getById, getByUsername, create, update, remove, renewSubscription };
