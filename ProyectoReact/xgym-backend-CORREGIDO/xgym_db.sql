-- ============================================================================
--  xgym_db.sql
--  Script completo para crear la base de datos de XGym.
--
--  INSTRUCCIONES DE USO:
--    1. Abre MySQL Workbench (o tu cliente favorito)
--    2. Ejecuta ESTE archivo completo
--    3. Listo — la BD queda lista con datos de prueba
--
--  RÚBRICA:
--    "Imágenes de cada tabla de sus bases de datos
--     (que se vean registros Y nombres de campos)"
-- ============================================================================

-- Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS xgym_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE xgym_db;

-- ============================================================================
--  TABLA: users
--  Cuentas de acceso al sistema (admin y usuarios normales).
--  La contraseña NUNCA se guarda en plano — siempre hasheada con bcrypt.
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,          -- hash bcrypt
  role          ENUM('admin','user') NOT NULL DEFAULT 'user',
  member_since  DATE         NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
--  TABLA: members
--  Información física/deportiva de cada miembro del gimnasio.
--  user_id es FK opcional: NULL si el admin creó el miembro manualmente
--  sin cuenta de acceso asociada.
-- ============================================================================
CREATE TABLE IF NOT EXISTS members (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NULL,          -- FK a users (puede ser NULL)
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(100) NOT NULL,
  phone             VARCHAR(20)  NOT NULL DEFAULT '—',
  member_since      DATE         NOT NULL,
  subscription_type VARCHAR(50)  NOT NULL DEFAULT 'Básico',
  status            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  total_visits      INT UNSIGNED NOT NULL DEFAULT 0,
  current_streak    INT UNSIGNED NOT NULL DEFAULT 0,
  personal_records  INT UNSIGNED NOT NULL DEFAULT 0,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_member_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
);

-- ============================================================================
--  TABLA: subscriptions
--  Historial de suscripciones asociadas a cada miembro.
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  member_id  INT UNSIGNED NOT NULL,
  plan       VARCHAR(50)  NOT NULL,
  start_date DATE         NOT NULL,
  end_date   DATE         NOT NULL,
  amount     VARCHAR(20)  NOT NULL DEFAULT '0€',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_subscription_member
    FOREIGN KEY (member_id) REFERENCES members(id)
    ON DELETE CASCADE
);

-- ============================================================================
--  TABLA: posts
--  Publicaciones del feed del gimnasio.
-- ============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  content        TEXT         NOT NULL,
  likes          INT UNSIGNED NOT NULL DEFAULT 0,
  comments_count INT UNSIGNED NOT NULL DEFAULT 0,
  timestamp      VARCHAR(50)  NOT NULL DEFAULT 'Justo ahora',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_post_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- ============================================================================
--  TABLA: comments
--  Comentarios asociados a cada post.
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id    INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  content    TEXT         NOT NULL,
  timestamp  VARCHAR(50)  NOT NULL DEFAULT 'Justo ahora',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_comment_post
    FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comment_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

-- ============================================================================
--  DATOS INICIALES (seed)
--
--  Contraseñas pre-hasheadas con bcrypt (salt=10):
--    admin    → "admin"
--    usuarios → "1234"
--
--  Para regenerar un hash desde Node.js:
--    node -e "const b=require('bcryptjs'); b.hash('admin',10).then(console.log)"
-- ============================================================================

-- Limpiar datos previos en orden inverso a las FK
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE comments;
TRUNCATE TABLE posts;
TRUNCATE TABLE subscriptions;
TRUNCATE TABLE members;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ── Usuarios ─────────────────────────────────────────────────────────────────
INSERT INTO users (username, email, password_hash, role, member_since) VALUES
('admin',
 'admin@xgym.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- "admin"
 'admin',
 '2023-01-01'),

('Carlos Mendoza',
 'carlos.mendoza@email.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', -- "1234"
 'user',
 '2024-01-15'),

('María González',
 'maria.gonzalez@email.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y',
 'user',
 '2024-03-20'),

('Juan Pérez',
 'juan.perez@email.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y',
 'user',
 '2023-11-10'),

('Ana Martínez',
 'ana.martinez@email.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y',
 'user',
 '2024-02-05'),

('Luis Rodríguez',
 'luis.rodriguez@email.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y',
 'user',
 '2024-04-12');

-- ── Miembros (user_id referencia a users.id) ─────────────────────────────────
INSERT INTO members (user_id, name, email, phone, member_since, subscription_type, status, total_visits, current_streak, personal_records) VALUES
(2, 'Carlos Mendoza',  'carlos.mendoza@email.com',  '+34 612 345 678', '2024-01-15', 'Premium',  'active',   87,  12, 5),
(3, 'María González',  'maria.gonzalez@email.com',  '+34 623 456 789', '2024-03-20', 'Básico',   'active',   42,   3, 2),
(4, 'Juan Pérez',      'juan.perez@email.com',      '+34 634 567 890', '2023-11-10', 'Premium',  'active',  120,  25, 9),
(5, 'Ana Martínez',    'ana.martinez@email.com',    '+34 645 678 901', '2024-02-05', 'Mensual',  'inactive', 15,   0, 1),
(6, 'Luis Rodríguez',  'luis.rodriguez@email.com',  '+34 656 789 012', '2024-04-12', 'Básico',   'active',   30,   6, 3);

-- ── Suscripciones ────────────────────────────────────────────────────────────
INSERT INTO subscriptions (member_id, plan, start_date, end_date, amount) VALUES
(1, 'Premium Anual',        '2024-01-15', '2025-01-15', '599€'),
(2, 'Básico Mensual',       '2024-04-20', '2024-05-20', '39€'),
(3, 'Premium Trimestral',   '2024-03-10', '2024-06-10', '169€'),
(4, 'Mensual Estándar',     '2024-04-05', '2024-05-05', '49€'),
(5, 'Básico Mensual',       '2024-04-12', '2024-05-12', '39€');

-- ── Posts de ejemplo ─────────────────────────────────────────────────────────
INSERT INTO posts (user_id, content, likes, timestamp, created_at) VALUES
(2, '¡Nuevo récord personal en sentadillas! 150kg x 5 reps. La constancia paga 💪', 24, 'Hace 2 horas',   NOW() - INTERVAL 2 HOUR),
(3, 'Clase de spinning de esta mañana fue increíble. ¡Gracias al instructor!',       18, 'Hace 4 horas',   NOW() - INTERVAL 4 HOUR),
(4, 'Completé mi primera rutina de 5x5. Agotado pero feliz. ¿Tips de recuperación?', 31, 'Hace 6 horas',   NOW() - INTERVAL 6 HOUR);

-- ── Comentarios de ejemplo ───────────────────────────────────────────────────
INSERT INTO comments (post_id, user_id, content, timestamp, created_at) VALUES
(1, 3, '¡Felicidades, Carlos! Bestia 💪',               'Hace 1 hora',  NOW() - INTERVAL 1 HOUR),
(1, 6, '¿Qué rutina sigues para sentadillas?',          'Hace 40 min',  NOW() - INTERVAL 40 MINUTE),
(2, 4, 'Esa clase siempre deja el alma en el piso 😅',  'Hace 2 horas', NOW() - INTERVAL 2 HOUR);

-- ── Verificación final ───────────────────────────────────────────────────────
SELECT 'users'         AS tabla, COUNT(*) AS registros FROM users
UNION ALL
SELECT 'members',      COUNT(*) FROM members
UNION ALL
SELECT 'subscriptions',COUNT(*) FROM subscriptions
UNION ALL
SELECT 'posts',        COUNT(*) FROM posts
UNION ALL
SELECT 'comments',     COUNT(*) FROM comments;
