# Sprint 1 — Implementaciones iniciales

Duración propuesta: 1 semana
Objetivo: Completar las tres primeras tareas prioritarias del backlog frontend y dejar un momento de prueba para validar integración básica con backend.

## Objetivos del sprint
- Mejorar la validación cliente-side en formularios (login, register, checkout).
- Implementar las páginas/admin necesarias (interfaz mínima) para CRUD de productos, categorías y ventas (UI + llamadas a `lib/api.ts`).
- Añadir persistencia de sesión en cliente (gestión de token, expiración básica y almacenamiento seguro).

## Tareas (desglose)

1) Mejorar validación cliente-side (email, password)
- Añadir validación de formato de email en `app/login/page.tsx` y `app/register/page.tsx`.
- Validar longitud y complejidad mínima de password (>=6 caracteres).
- Mostrar mensajes amigables junto al campo y prevenir submit hasta pasar validación.
- Tests manuales: probar con emails inválidos y contraseñas cortas.

2) Páginas Admin: CRUD de productos, categorías, ventas, landing
- Crear ruta `app/admin` (si no existe) con navegación a subpáginas: `products`, `categories`, `sales`, `landing`.
- Implementar UI mínima para listar items (tabla/cards), formularios para crear/editar y botones de borrar.
- Consumir `apiClient` (`lib/api.ts`) para llamadas; manejar respuestas `{ error, status }` ya soportadas.
- Proteger la UI admin (mostrar aviso si no hay token/role en localStorage) — esto es UI-side hasta integrar middleware backend.

3) Persistencia de sesión cliente
- Almacenar token en `localStorage` y guardar la fecha de expiración estimada si el JWT contiene `exp`.
- Añadir helper en `lib/api.ts` o `contexts/` para inyectar `Authorization` header automáticamente si existe token.
- Implementar logout que borre token y role del `localStorage`.

## Criterios de aceptación
- Formularios no envían datos con emails inválidos y muestran mensajes claros.
- Admin UI permite crear/editar/borrar (UI + llamadas API) y muestra errores de forma amigable.
- Token se mantiene en `localStorage` y se agrega al header `Authorization: Bearer <token>` en llamadas API.

## Momento de prueba (QA)
1. Levantar frontend (`pnpm dev` / `npm run dev`) y asegurar `NEXT_PUBLIC_API_URL` apuntando al backend de pruebas.
2. Prueba login:
   - Usar email inválido -> ver mensaje de validación cliente.
   - Usar credenciales inválidas -> ver mensaje amigable del backend (p.ej. "Credenciales inválidas").
3. Probar admin:
   - Ingresar como admin (usar seed o crear admin en backend). Acceder a `app/admin`.
   - Crear un producto con imagen (si no hay upload aún, usar URL de imagen), editar y borrar. Verificar llamadas y UI.
4. Verificar persistencia de sesión:
   - Login exitoso -> refrescar página -> seguir autenticado (token persistente).
   - Hacer logout -> token eliminado y acceso a áreas protegidas bloqueado.

## Entregables al final del sprint
- Pull request con cambios en:
  - `app/login/page.tsx`, `app/register/page.tsx` (validaciones)
  - Nuevas páginas en `app/admin/*` para CRUD
  - Helpers en `lib` para persistencia/headers
  - Actualización del `TODO` tracker (marcar tareas completadas)
- Archivo de pruebas manuales (este `SPRINT_1.md`) con resultados y notas.

---

Si confirmas, comienzo implementando la Tarea 1 (validación cliente-side) y actualizaré el tracker marcando progreso. ¿Inicio ahora con la validación del formulario de login y registro?