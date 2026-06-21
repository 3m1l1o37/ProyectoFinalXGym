
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,   // espera si todas las conexiones están ocupadas
  connectionLimit: 10,        // máximo de conexiones simultáneas en el pool
  queueLimit: 0,              // sin límite en la cola de espera
});

// Prueba de conexión al iniciar (falla rápido si la config es incorrecta)
pool.getConnection()
  .then((conn) => {
    console.log("✅ Conexión a MySQL establecida correctamente");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Error al conectar con MySQL:", err.message);
    process.exit(1); // detiene el servidor si no hay BD
  });

module.exports = pool;
