# TODO_BACKEND — Prompts para GitHub Copilot

A continuación hay tareas backend extraídas del proyecto. Cada sección es un prompt listo para pegar en GitHub Copilot (o en cualquier asistente de código) para generar implementaciones en Go (Gin) y SQL, basadas en la especificación de `BACK_API.md` y `backend/seed_data.sql`.

---

## 1 Implementar modelos de datos y migraciones
Prompt:
"Implementa los modelos de datos en Go para el backend usando `sqlx` (o `database/sql`) y Gin como router. Crea un archivo `models.go` con estructuras: `User`, `Product`, `Category`, `Sale`, `SaleItem`, `LandingPageData`, `LandingSection`. Usa los tipos y constraints definidos en `BACK_API.md` (ej. `SaleStatus` con valores 'pendiente','planificada','realizada','cancelada'). Añade funciones para crear las tablas SQL (migrations) compatibles con PostgreSQL y un script `migrate.go` que aplique las migraciones. Asegura campos `created_at` y `updated_at`, índices para búsquedas por categoría y claves foráneas para `SaleItem -> Product` y `Sale -> User`." 

Resultado esperado: `models.go`, `migrations/*.sql`, `migrate.go`.

---

## 2 Implementar funciones de base de datos (repositorio)
Prompt:
"Genera un paquete `repository` en Go que proporcione funciones CRUD para `Product`, `Category`, `User`, y funciones específicas para ventas: `CreateSale(tx, sale)`, `GetSaleByID`, `CancelSale` (solo si `status == 'pendiente'`). Usa transacciones para operaciones que modifiquen stock o impliquen múltiples tablas. Escribe interfaces para facilitar tests y mocks." 

Resultado esperado: `repository/repository.go` con interfaces y `repository/postgres.go` con implementaciones.

---

## 3 Implementar autenticación JWT y handlers auth
Prompt:
"Implementa endpoints de autenticación en Gin: `POST /api/auth/register` y `POST /api/auth/login`. Usa `bcrypt` para contraseñas y JWT (HS256) para tokens de acceso. Tokens deben incluir `userId` y `role`. Implementa un middleware `AuthMiddleware` que valide JWT, y `AdminMiddleware` que verifique `role=='admin'`. Añade expiración y estructura de refresh tokens si es posible (o deja nota para agregar refresh tokens)." 

Resultado esperado: `handlers/auth.go`, `middleware/auth.go`, configuración de secret via env var.

---

## 4 Implementar handlers REST (productos, categorías, ventas, landing)
Prompt:
"Crea handlers para REST siguiendo `BACK_API.md`:
- `GET /api/products` (filtrado por categoría opcional)
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- Endpoints equivalentes para `categories`
- `POST /api/sales` para crear venta (cliente): validar existencia de productos, calcular totales, crear `sale` y `sale_items` en una transacción
- `PATCH /api/sales/:id/status` o similar para que admin cambie status
- `POST /api/landing`/`GET /api/landing` para contenido editable de landing

Incluye validación de entrada (email, cantidades >0, precio >=0). Devuelve errores JSON consistentes: `{ "error": "Mensaje" }` con status apropiado (400, 401, 403, 404, 500)." 

Resultado esperado: `handlers/products.go`, `handlers/categories.go`, `handlers/sales.go`, `handlers/landing.go`.

---

## 5 Middleware y CORS
Prompt:
"Implementa middlewares en Gin:
- `AuthMiddleware` que extrae y valida JWT y añade `userID` y `role` al contexto
- `AdminMiddleware` que fuerza `role === 'admin'`
- `CORS` middleware configurable por `ALLOWED_ORIGINS`
- Un `Recovery` middleware que capture panics y devuelva `{ error: 'internal server error' }` con 500

Incluye logging mínimo de requests y respuesta de status para debugging." 

Resultado esperado: `middleware/*.go`.

---

## 6 Validaciones y manejo de errores
Prompt:
"Asegura validación server-side con mensajes claros y localizables. Para emails use validación robusta (ej. regex o librería). Normaliza errores para devolver siempre JSON con `error` corto y opcional `details` array para campos. No exponer errores internos (stack traces) en producción." 

Resultado esperado: utilitario `validation.go` y uso en handlers.

---

## 7 Seed data y script de inicialización
Prompt:
"Crea un script `seed.go` que ejecute `backend/seed_data.sql` o que inserte datos de prueba programáticamente usando el repositorio. Debe crear un admin user con contraseña documentada y datos de ejemplo para productos y categorías." 

Resultado esperado: `cmd/seed/main.go` o `scripts/seed.sh`.

---

## 8 Transacciones para ventas y concurrencia
Prompt:
"Para `CreateSale` usa transacción: validar productos, decrementar stock (si se maneja), crear `sale` y `sale_items`. Maneja condiciones de carrera usando SELECT FOR UPDATE si es necesario. Asegura rollback completo en error." 

Resultado esperado: implementación transaccional en `repository` y uso en handler de ventas.

---

## 9 Tests para backend (unit + integration)
Prompt:
"Genera test suites en Go: unit tests para repositorio con mocks, integration tests usando una base de datos de prueba (Docker/SQLite/Postgres). Tests críticos: registro/login, crear venta (transacción), crear/editar producto (admin), validar respuestas de error y códigos HTTP." 

Resultado esperado: `*_test.go` con ejemplos y comandos para ejecutar tests.

---

## 10 Soporte para uploads de imágenes
Prompt:
"Implementa endpoint `POST /api/uploads` (admin) que acepte multipart/form-data y suba imágenes a almacenamiento local o S3. Devuelve URL pública. En `Product` y `LandingSection` guarda la URL. Añade validaciones de tipo y tamaño (ej. max 5MB)." 

Resultado esperado: `handlers/uploads.go` y configuración `STORAGE_PROVIDER`.

---

## 11 OpenAPI / documentación de la API
Prompt:
"Genera un archivo OpenAPI (YAML o JSON) que describa todos los endpoints implementados, rutas, esquemas de request/response y códigos de error. Incluye ejemplos de request para `login`, `createSale` y `createProduct`." 

Resultado esperado: `openapi.yaml`.

---

## 12 Checklist final y entrega a frontend
Prompt:
"Prepara un checklist que el frontend necesita: endpoints, payloads, códigos de error esperados, headers (Authorization Bearer), y ejemplo de responses. Añade notas sobre `NEXT_PUBLIC_API_URL` y cors para desarrollo local." 

Resultado esperado: `BACKEND_README.md` / sección en `BACK_API.md`.

---

Pega cada prompt en GitHub Copilot o en tu asistente y solicita que genere los archivos mencionados; revisa, adapta el estilo y los nombres a las convenciones del repo. Si quieres, puedo encargarme de generar alguno de estos artefactos (archivos o handlers) directamente en el repo local; dime por cuál empezamos."

---

## Nuevos endpoints requeridos (últimos 2 commits)

Basado en los cambios recientes en el frontend (admin UI, profile edits, landing editor, uploads, filtros por categoría), estos endpoints adicionales deben implementarse en el backend. Cada entrada incluye un prompt listo para Copilot y el resultado esperado.

### 1. Perfil de usuario
Prompt:
"Implementa endpoints para editar y eliminar cuentas de usuario:
- `PUT /api/users/:id` — Actualiza `name`, `email` (y opcionalmente otros campos permitidos). Validar que el `id` del token coincida con el `id` o que el rol sea `admin`.
- `DELETE /api/users/:id` — Elimina la cuenta del usuario. Requiere doble confirmación en el cliente; en el backend asegúrate de borrar o marcar cuentas como inactivas (soft-delete) y limpiar relaciones (opcional).
Incluye validaciones, respuestas JSON consistentes y autorización."

Resultado esperado: `handlers/users.go` con `UpdateUser` y `DeleteUser`, tests y migración si se añade `deleted_at`.

### 2. Categorías y Productos (borrar/editar desde admin)
Prompt:
"Añade/activa endpoints faltantes para categorías y productos:
- `POST` /api/products/ - Crear nuevo producto (admin)
- `PUT /api/categories/:id` — Editar nombre/slug/visible (admin)
- `PUT /api/products/:id` — Editar nombre/slug/visible (admin)
- `DELETE /api/categories/:id` — Borrar categoría (admin). Si existen productos asociados, decidir política: impedir borrado o reasignar productos a categoría por defecto.
- `DELETE /api/products/:id` — Borrar categoría (admin). Si existen productos asociados, decidir política: impedir borrado o reasignar productos a categoría por defecto.
Devuelve 409 si existen dependencias y la política no permite borrado automático."

Resultado esperado: `handlers/categories.go` con handlers `UpdateCategory` y `DeleteCategory` y cambios en `repository`.

### 3. Uploads de imágenes (productos + landing + avatars)
Prompt:
"Implementa `POST /api/uploads` que acepte `multipart/form-data` y almacene imágenes localmente o en S3:
- Validar tipo `image/*` y tamaño máximo (p.ej. 5MB)
- Retornar `{ url: 'https://.../path.jpg' }`
- Asociar a `Product.image`, `LandingSection.image` desde el frontend
- Proteger endpoint (admin)
Incluye tests y configuración para `STORAGE_PROVIDER` (local/s3)."

Resultado esperado: `handlers/uploads.go`, utilitario `storage/*` y ejemplo en README.

### 4. Guardar/actualizar Landing Page
Prompt:
"Asegura endpoints para gestionar el contenido editable de la landing:
- `GET /api/landing` — Obtener `LandingPageData` (ya existente)
- `PUT /api/landing` — Reemplazar/actualizar `LandingPageData` completo (admin)
- `PATCH /api/landing/sections/:id` — Editar sección (admin)
- `POST /api/landing/sections` — Añadir nueva sección (admin)
- `DELETE /api/landing/sections/:id` — Borrar sección (admin)
Validar orden (`order`), visibilidad y rutas de imagen."

Resultado esperado: `handlers/landing.go` con handlers CRUD para secciones y `repository` support.

### 5. Refresh token / manejo 401
Prompt:
"Agrega soporte básico para refresh tokens y endpoint:
- `POST /api/auth/refresh` — Recibe refresh token, valida y emite nuevo access token (y opcionalmente nuevo refresh token)
Implementa almacenamiento seguro de refresh tokens (DB table) y revocación. Documenta expiraciones."

Resultado esperado: `handlers/auth.go` actualizado, `repository` para tokens, migración.

### 6. Endpoint para listar productos filtrados (mejorado)
Prompt:
"Mejora `GET /api/products` para soportar query params adicionales usados por frontend:
- `?category=<id>` — filtro por categoría
- `?search=...` — búsqueda por nombre/description
- `?stock_gt=0` — solo productos en stock
- paginación `?page=&limit=` y metadata en respuesta
Incluye índices SQL para acelerar búsquedas."

Resultado esperado: `handlers/products.go` con parámetros parseados y `repository` queries optimizadas.

### 7. Validación política al borrar categoría/producto
Prompt:
"Implementa reglas en el backend para operaciones destructivas:
- Si `DELETE /api/categories/:id` y existen productos asociados, devolver 409 con mensaje explicando la política (o mover a categoría por defecto si se elige esa política).
- Si `DELETE /api/products/:id` asegurar que no rompa `sale_items` (o prevenir borrado si hay ventas históricas, recomendar `archived` flag)."

Resultado esperado: Reglas implementadas en handlers y repositorio, mensajes de error consistentes.

---

Incluye estas entradas en tus prioridades de sprint: uploads, landing CRUD y perfil (PUT/DELETE) son críticas para el admin; refresh tokens y políticas de borrado son importantes para seguridad y consistencia.
