/**
 * src/controllers/subscriptions.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Gestión de suscripciones de los miembros.
 */

const pool = require("../config/db");

/** GET /api/subscriptions — Lista todas las suscripciones (admin only). */
async function getAll(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT s.id,
              m.name AS userName,
              s.plan,
              s.start_date AS startDate,
              s.end_date AS endDate,
              DATEDIFF(s.end_date, CURDATE()) AS daysRemaining,
              s.amount
       FROM subscriptions s
       JOIN members m ON s.member_id = m.id
       ORDER BY s.end_date ASC`
    );
    return res.status(200).json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error en getAll subscriptions:", err);
    return res.status(500).json({ ok: false, message: "Error al obtener suscripciones." });
  }
}

module.exports = { getAll };
