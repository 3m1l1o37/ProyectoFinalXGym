# XGym Backend — API REST con Node.js + Express + MySQL

## Estructura del proyecto

```
xgym-backend/
├── src/
│   ├── index.js                  ← Punto de entrada (Express + rutas)
│   ├── config/
│   │   └── db.js                 ← Pool de conexión a MySQL
│   ├── controllers/
│   │   ├── auth.controller.js    ← Register / Login
│   │   ├── members.controller.js ← ABCC de miembros
│   │   ├── posts.controller.js   ← Feed de publicaciones
│   │   └── subscriptions.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── members.routes.js
│   │   ├── posts.routes.js
│   │   └── subscriptions.routes.js
│   └── middlewares/
│       ├── auth.middleware.js    ← verifyToken + requireRole (JWT)
│       └── validate.middleware.js← Validaciones del lado del servidor
├── xgym_db.sql                   ← Script SQL completo
├── .env.example                  ← Variables de entorno de ejemplo
└── package.json
```

---

## Pasos para ejecutarlo

### 1. Crear la base de datos MySQL

```sql
-- En MySQL Workbench o tu cliente:
-- Abre xgym_db.sql y ejecútalo completo (Ctrl+Shift+Enter)
```

El script crea todas las tablas y los datos de prueba automáticamente.

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus datos reales:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_DE_MYSQL
DB_NAME=xgym_db
JWT_SECRET=cualquier_cadena_larga_y_secreta
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:5173
```

### 3. Instalar dependencias y arrancar

```bash
npm install
npm run dev     # con hot-reload (nodemon)
# o
npm start       # sin hot-reload
```

Verifica que funciona:
```
GET http://localhost:4000/api/health
→ { "ok": true, "message": "XGym API funcionando correctamente 🏋️" }
```

---

## Cuentas de prueba

| Usuario         | Contraseña | Rol   |
|-----------------|------------|-------|
| admin           | admin      | admin |
| Carlos Mendoza  | 1234       | user  |
| María González  | 1234       | user  |
| Juan Pérez      | 1234       | user  |

---

## Endpoints disponibles

### Auth (públicas)
```
POST /api/auth/register   { username, password, email }
POST /api/auth/login      { username, password }
```

### Members (requieren Bearer token)
```
GET    /api/members                    → lista (admin)
GET    /api/members/by-username/:name  → perfil propio
GET    /api/members/:id                → detalle (admin)
POST   /api/members                    → ALTA (admin)
PUT    /api/members/:id                → CAMBIO
DELETE /api/members/:id                → BAJA (admin)
```

### Posts (requieren Bearer token)
```
GET    /api/posts                  → lista posts
GET    /api/posts/:id              → detalle
POST   /api/posts                  → crear
DELETE /api/posts/:id              → eliminar
POST   /api/posts/:id/like         → toggle like
GET    /api/posts/:id/comments     → comentarios
POST   /api/posts/:id/comments     → comentar
```

### Subscriptions (requieren Bearer token + rol admin)
```
GET /api/subscriptions
```
