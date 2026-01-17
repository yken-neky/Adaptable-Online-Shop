# Especificaciones del Backend API - Go + Gin + SQLite3

Este documento contiene todas las especificaciones necesarias para implementar el backend API REST que el frontend necesita para funcionar completamente.

## 📋 Tabla de Contenidos

1. [Tecnologías y Requisitos](#tecnologías-y-requisitos)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Modelos de Datos](#modelos-de-datos)
4. [Esquema de Base de Datos](#esquema-de-base-de-datos)
5. [Endpoints de la API](#endpoints-de-la-api)
6. [Autenticación JWT](#autenticación-jwt)
7. [Middleware](#middleware)
8. [Código de Ejemplo](#código-de-ejemplo)

---

## 🛠 Tecnologías y Requisitos

### Dependencias necesarias:
```go
go get github.com/gin-gonic/gin
go get github.com/golang-jwt/jwt/v5
go get github.com/google/uuid
go get golang.org/x/crypto/bcrypt
go get github.com/mattn/go-sqlite3
go get github.com/jmoiron/sqlx  // Opcional pero recomendado
```

### Versión de Go:
- Go 1.21 o superior

---

## 📁 Estructura del Proyecto

```
backend/
├── main.go
├── go.mod
├── go.sum
├── database.db          # SQLite3 database (se crea automáticamente)
├── config/
│   └── config.go
├── models/
│   ├── user.go
│   ├── product.go
│   ├── category.go
│   ├── sale.go
│   └── landing.go
├── database/
│   └── db.go
├── handlers/
│   ├── auth.go
│   ├── products.go
│   ├── categories.go
│   ├── sales.go
│   └── landing.go
├── middleware/
│   ├── auth.go
│   └── cors.go
└── utils/
    ├── jwt.go
    └── password.go
```

---

## 📊 Modelos de Datos

### User (Usuario)
```go
type User struct {
    ID        string    `json:"id" db:"id"`
    Email     string    `json:"email" db:"email"`
    Name      string    `json:"name" db:"name"`
    Password  string    `json:"-" db:"password"` // No se expone en JSON
    Role      string    `json:"role" db:"role"` // "admin" o "cliente"
    CreatedAt time.Time `json:"createdAt" db:"created_at"`
}
```

### Category (Categoría)
```go
type Category struct {
    ID          string    `json:"id" db:"id"`
    Name        string    `json:"name" db:"name"`
    Description *string   `json:"description,omitempty" db:"description"`
    Image       *string   `json:"image,omitempty" db:"image"`
    CreatedAt   time.Time `json:"createdAt" db:"created_at"`
    UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}
```

### Product (Producto)
```go
type Product struct {
    ID          string     `json:"id" db:"id"`
    Name        string     `json:"name" db:"name"`
    Description string     `json:"description" db:"description"`
    Price       float64    `json:"price" db:"price"`
    Image       string     `json:"image" db:"image"`
    CategoryID  string     `json:"categoryId" db:"category_id"`
    Stock       *int       `json:"stock,omitempty" db:"stock"`
    CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
    UpdatedAt   time.Time  `json:"updatedAt" db:"updated_at"`
    Category    *Category  `json:"category,omitempty"` // Para joins
}
```

### Sale (Venta/Compra)
```go
type Sale struct {
    ID        string     `json:"id" db:"id"`
    UserID    string     `json:"userId" db:"user_id"`
    Status    string     `json:"status" db:"status"` // "pendiente", "planificada", "realizada", "cancelada"
    Total     float64    `json:"total" db:"total"`
    CreatedAt time.Time  `json:"createdAt" db:"created_at"`
    UpdatedAt time.Time  `json:"updatedAt" db:"updated_at"`
    User      *User      `json:"user,omitempty"` // Para joins
    Items     []SaleItem `json:"items"`
}
```

### SaleItem (Item de Venta)
```go
type SaleItem struct {
    ID        string   `json:"id" db:"id"`
    SaleID    string   `json:"saleId" db:"sale_id"`
    ProductID string   `json:"productId" db:"product_id"`
    Quantity  int      `json:"quantity" db:"quantity"`
    Price     float64  `json:"price" db:"price"` // Precio al momento de la venta
    Product   *Product `json:"product,omitempty"` // Para joins
}
```

### LandingSection (Sección de Landing)
```go
type LandingSection struct {
    ID      string  `json:"id" db:"id"`
    Type    string  `json:"type" db:"type"` // "hero", "about", "features", "testimonials", "contact"
    Title   *string `json:"title,omitempty" db:"title"`
    Content *string `json:"content,omitempty" db:"content"`
    Image   *string `json:"image,omitempty" db:"image"`
    Order   int     `json:"order" db:"order"`
    Visible bool    `json:"visible" db:"visible"`
}
```

### LandingPageData (Datos de Landing Page)
```go
type LandingPageData struct {
    CompanyName        string          `json:"companyName"`
    CompanyDescription *string         `json:"companyDescription,omitempty"`
    Logo               *string         `json:"logo,omitempty"`
    Sections           []LandingSection `json:"sections"`
}
```

---

## 🗄 Esquema de Base de Datos

### Tabla: users
```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'cliente')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: categories
```sql
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: products
```sql
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT NOT NULL,
    category_id TEXT NOT NULL,
    stock INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### Tabla: sales
```sql
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pendiente', 'planificada', 'realizada', 'cancelada')),
    total REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tabla: sale_items
```sql
CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### Tabla: landing_sections
```sql
CREATE TABLE IF NOT EXISTS landing_sections (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('hero', 'about', 'features', 'testimonials', 'contact')),
    title TEXT,
    content TEXT,
    image TEXT,
    "order" INTEGER NOT NULL,
    visible BOOLEAN NOT NULL DEFAULT 1
);
```

### Tabla: landing_config
```sql
CREATE TABLE IF NOT EXISTS landing_config (
    key TEXT PRIMARY KEY,
    value TEXT
);
```

**Nota:** La tabla `landing_config` almacenará:
- `company_name` → Nombre de la empresa
- `company_description` → Descripción de la empresa
- `logo` → URL del logo

---

## 🔌 Endpoints de la API

### Base URL
```
http://localhost:3001/api
```

### Formato de Respuesta de Error
```json
{
    "error": "Mensaje de error descriptivo"
}
```

---

## 🔐 Autenticación

### POST /auth/register
Registra un nuevo usuario.

**Request Body:**
```json
{
    "email": "usuario@example.com",
    "password": "password123",
    "name": "Nombre Usuario"
}
```

**Response 201:**
```json
{
    "user": {
        "id": "uuid",
        "email": "usuario@example.com",
        "name": "Nombre Usuario",
        "role": "cliente",
        "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
}
```

**Errores:**
- `400`: Email ya existe o datos inválidos
- `500`: Error del servidor

---

### POST /auth/login
Inicia sesión con email y contraseña.

**Request Body:**
```json
{
    "email": "usuario@example.com",
    "password": "password123"
}
```

**Response 200:**
```json
{
    "user": {
        "id": "uuid",
        "email": "usuario@example.com",
        "name": "Nombre Usuario",
        "role": "cliente",
        "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
}
```

**Errores:**
- `401`: Credenciales inválidas
- `500`: Error del servidor

---

### GET /auth/me
Obtiene el usuario actual autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Nombre Usuario",
    "role": "cliente",
    "createdAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `401`: Token inválido o expirado
- `500`: Error del servidor

---

## 📦 Productos

### GET /products
Obtiene todos los productos. Opcionalmente filtra por categoría.

**Query Parameters:**
- `categoryId` (opcional): ID de la categoría para filtrar

**Response 200:**
```json
[
    {
        "id": "uuid",
        "name": "Producto 1",
        "description": "Descripción del producto",
        "price": 99.99,
        "image": "https://example.com/image.jpg",
        "categoryId": "category-uuid",
        "category": {
            "id": "category-uuid",
            "name": "Categoría",
            "description": "Descripción",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        },
        "stock": 10,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }
]
```

---

### GET /products/:id
Obtiene un producto por ID.

**Response 200:**
```json
{
    "id": "uuid",
    "name": "Producto 1",
    "description": "Descripción del producto",
    "price": 99.99,
    "image": "https://example.com/image.jpg",
    "categoryId": "category-uuid",
    "category": {
        "id": "category-uuid",
        "name": "Categoría",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    },
    "stock": 10,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `404`: Producto no encontrado

---

### POST /products
Crea un nuevo producto. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "name": "Nuevo Producto",
    "description": "Descripción",
    "price": 99.99,
    "image": "https://example.com/image.jpg",
    "categoryId": "category-uuid",
    "stock": 10
}
```

**Response 201:**
```json
{
    "id": "uuid",
    "name": "Nuevo Producto",
    "description": "Descripción",
    "price": 99.99,
    "image": "https://example.com/image.jpg",
    "categoryId": "category-uuid",
    "stock": 10,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `400`: Datos inválidos
- `404`: Categoría no existe

---

### PUT /products/:id
Actualiza un producto. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "name": "Producto Actualizado",
    "description": "Nueva descripción",
    "price": 149.99,
    "image": "https://example.com/new-image.jpg",
    "categoryId": "category-uuid",
    "stock": 20
}
```

**Response 200:**
```json
{
    "id": "uuid",
    "name": "Producto Actualizado",
    "description": "Nueva descripción",
    "price": 149.99,
    "image": "https://example.com/new-image.jpg",
    "categoryId": "category-uuid",
    "stock": 20,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `404`: Producto no encontrado

---

### DELETE /products/:id
Elimina un producto. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Response 204:** Sin contenido

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `404`: Producto no encontrado

---

## 🏷 Categorías

### GET /categories
Obtiene todas las categorías.

**Response 200:**
```json
[
    {
        "id": "uuid",
        "name": "Categoría 1",
        "description": "Descripción",
        "image": "https://example.com/image.jpg",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }
]
```

---

### GET /categories/:id
Obtiene una categoría por ID.

**Response 200:**
```json
{
    "id": "uuid",
    "name": "Categoría 1",
    "description": "Descripción",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `404`: Categoría no encontrada

---

### POST /categories
Crea una nueva categoría. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "name": "Nueva Categoría",
    "description": "Descripción opcional",
    "image": "https://example.com/image.jpg"
}
```

**Response 201:**
```json
{
    "id": "uuid",
    "name": "Nueva Categoría",
    "description": "Descripción opcional",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `400`: Datos inválidos

---

### PUT /categories/:id
Actualiza una categoría. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "name": "Categoría Actualizada",
    "description": "Nueva descripción",
    "image": "https://example.com/new-image.jpg"
}
```

**Response 200:**
```json
{
    "id": "uuid",
    "name": "Categoría Actualizada",
    "description": "Nueva descripción",
    "image": "https://example.com/new-image.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `404`: Categoría no encontrada

---

### DELETE /categories/:id
Elimina una categoría. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Response 204:** Sin contenido

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `404`: Categoría no encontrada
- `400`: No se puede eliminar si tiene productos asociados

---

## 💰 Ventas/Compras

### GET /sales
Obtiene todas las ventas. Si es admin, obtiene todas. Si es cliente, solo las suyas.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `userId` (opcional): Filtrar por usuario (solo admin)

**Response 200:**
```json
[
    {
        "id": "uuid",
        "userId": "user-uuid",
        "user": {
            "id": "user-uuid",
            "name": "Nombre Usuario",
            "email": "usuario@example.com"
        },
        "status": "pendiente",
        "total": 199.98,
        "items": [
            {
                "id": "item-uuid",
                "saleId": "sale-uuid",
                "productId": "product-uuid",
                "product": {
                    "id": "product-uuid",
                    "name": "Producto",
                    "price": 99.99
                },
                "quantity": 2,
                "price": 99.99
            }
        ],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }
]
```

**Errores:**
- `401`: No autenticado

---

### GET /sales/:id
Obtiene una venta por ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
    "id": "uuid",
    "userId": "user-uuid",
    "user": {
        "id": "user-uuid",
        "name": "Nombre Usuario"
    },
    "status": "pendiente",
    "total": 199.98,
    "items": [
        {
            "id": "item-uuid",
            "saleId": "sale-uuid",
            "productId": "product-uuid",
            "product": {
                "id": "product-uuid",
                "name": "Producto",
                "price": 99.99
            },
            "quantity": 2,
            "price": 99.99
        }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No tiene permiso para ver esta venta
- `404`: Venta no encontrada

---

### POST /sales
Crea una nueva venta (compra). **Requiere autenticación.**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "items": [
        {
            "productId": "product-uuid-1",
            "quantity": 2
        },
        {
            "productId": "product-uuid-2",
            "quantity": 1
        }
    ]
}
```

**Response 201:**
```json
{
    "id": "uuid",
    "userId": "user-uuid",
    "status": "pendiente",
    "total": 299.97,
    "items": [
        {
            "id": "item-uuid-1",
            "saleId": "sale-uuid",
            "productId": "product-uuid-1",
            "product": {
                "id": "product-uuid-1",
                "name": "Producto 1",
                "price": 99.99
            },
            "quantity": 2,
            "price": 99.99
        },
        {
            "id": "item-uuid-2",
            "saleId": "sale-uuid",
            "productId": "product-uuid-2",
            "product": {
                "id": "product-uuid-2",
                "name": "Producto 2",
                "price": 99.99
            },
            "quantity": 1,
            "price": 99.99
        }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Lógica:**
1. Validar que todos los productos existan
2. Obtener el precio actual de cada producto
3. Calcular el total
4. Crear la venta con status "pendiente"
5. Crear los items de venta

**Errores:**
- `401`: No autenticado
- `400`: Productos no encontrados o datos inválidos

---

### PATCH /sales/:id/status
Actualiza el estado de una venta. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "status": "planificada"
}
```

**Valores válidos:** `"pendiente"`, `"planificada"`, `"realizada"`, `"cancelada"`

**Response 200:**
```json
{
    "id": "uuid",
    "userId": "user-uuid",
    "status": "planificada",
    "total": 199.98,
    "items": [...],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `400`: Estado inválido
- `404`: Venta no encontrada

---

### PATCH /sales/:id/cancel
Cancela una venta. Solo el cliente que la creó puede cancelarla si está en estado "pendiente".

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
    "id": "uuid",
    "userId": "user-uuid",
    "status": "cancelada",
    "total": 199.98,
    "items": [...],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es el dueño de la venta o no está en estado "pendiente"
- `404`: Venta no encontrada

---

## 🏠 Landing Page

### GET /landing
Obtiene todos los datos de la landing page.

**Response 200:**
```json
{
    "companyName": "Tienda Online",
    "companyDescription": "Descripción de la empresa",
    "logo": "https://example.com/logo.jpg",
    "sections": [
        {
            "id": "uuid",
            "type": "hero",
            "title": "Bienvenido",
            "content": "Contenido de la sección",
            "image": "https://example.com/image.jpg",
            "order": 1,
            "visible": true
        }
    ]
}
```

**Lógica:**
1. Obtener configuración de `landing_config`
2. Obtener todas las secciones ordenadas por `order`
3. Filtrar solo las visibles

---

### PUT /landing
Actualiza los datos de la landing page. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "companyName": "Nuevo Nombre",
    "companyDescription": "Nueva descripción",
    "logo": "https://example.com/new-logo.jpg"
}
```

**Response 200:**
```json
{
    "companyName": "Nuevo Nombre",
    "companyDescription": "Nueva descripción",
    "logo": "https://example.com/new-logo.jpg",
    "sections": [...]
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es admin

---

### GET /landing/sections
Obtiene todas las secciones. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
[
    {
        "id": "uuid",
        "type": "hero",
        "title": "Título",
        "content": "Contenido",
        "image": "https://example.com/image.jpg",
        "order": 1,
        "visible": true
    }
]
```

---

### POST /landing/sections
Crea una nueva sección. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "type": "hero",
    "title": "Nuevo Título",
    "content": "Nuevo contenido",
    "image": "https://example.com/image.jpg",
    "order": 1,
    "visible": true
}
```

**Response 201:**
```json
{
    "id": "uuid",
    "type": "hero",
    "title": "Nuevo Título",
    "content": "Nuevo contenido",
    "image": "https://example.com/image.jpg",
    "order": 1,
    "visible": true
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `400`: Tipo inválido o datos inválidos

---

### PUT /landing/sections/:id
Actualiza una sección. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "title": "Título Actualizado",
    "content": "Contenido actualizado",
    "image": "https://example.com/new-image.jpg",
    "order": 2,
    "visible": false
}
```

**Response 200:**
```json
{
    "id": "uuid",
    "type": "hero",
    "title": "Título Actualizado",
    "content": "Contenido actualizado",
    "image": "https://example.com/new-image.jpg",
    "order": 2,
    "visible": false
}
```

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `404`: Sección no encontrada

---

### DELETE /landing/sections/:id
Elimina una sección. **Requiere autenticación y rol admin.**

**Headers:**
```
Authorization: Bearer {token}
```

**Response 204:** Sin contenido

**Errores:**
- `401`: No autenticado
- `403`: No es admin
- `404`: Sección no encontrada

---

## 🔒 Autenticación JWT

### Configuración
- **Algoritmo:** HS256
- **Secret Key:** Variable de entorno `JWT_SECRET` (mínimo 32 caracteres)
- **Expiración:** 24 horas

### Estructura del Token
```go
type Claims struct {
    UserID string `json:"userId"`
    Email  string `json:"email"`
    Role   string `json:"role"`
    jwt.RegisteredClaims
}
```

### Generación del Token
```go
token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
    UserID: user.ID,
    Email:  user.Email,
    Role:   user.Role,
    RegisteredClaims: jwt.RegisteredClaims{
        ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
        IssuedAt:  jwt.NewNumericDate(time.Now()),
    },
})

tokenString, err := token.SignedString([]byte(jwtSecret))
```

---

## 🛡 Middleware

### AuthMiddleware
Verifica que el token JWT sea válido y extrae la información del usuario.

```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        if tokenString == "" {
            c.JSON(401, gin.H{"error": "Token no proporcionado"})
            c.Abort()
            return
        }
        
        // Remover "Bearer " prefix
        if strings.HasPrefix(tokenString, "Bearer ") {
            tokenString = tokenString[7:]
        }
        
        // Validar y parsear token
        // Extraer userID, email, role
        // Guardar en c.Set("userID", userID)
        // Guardar en c.Set("role", role)
        
        c.Next()
    }
}
```

### AdminMiddleware
Verifica que el usuario sea admin.

```go
func AdminMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        role, exists := c.Get("role")
        if !exists || role != "admin" {
            c.JSON(403, gin.H{"error": "Acceso denegado. Se requiere rol de administrador"})
            c.Abort()
            return
        }
        c.Next()
    }
}
```

### CORSMiddleware
Habilita CORS para el frontend.

```go
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}
```

---

## 💻 Código de Ejemplo

### main.go (Estructura básica)
```go
package main

import (
    "log"
    "os"
    
    "github.com/gin-gonic/gin"
    _ "github.com/mattn/go-sqlite3"
)

func main() {
    // Inicializar base de datos
    db, err := InitDB()
    if err != nil {
        log.Fatal("Error inicializando base de datos:", err)
    }
    defer db.Close()
    
    // Crear tablas
    if err := CreateTables(db); err != nil {
        log.Fatal("Error creando tablas:", err)
    }
    
    // Configurar router
    r := gin.Default()
    
    // Middleware
    r.Use(CORSMiddleware())
    
    // Rutas públicas
    api := r.Group("/api")
    {
        api.POST("/auth/register", RegisterHandler)
        api.POST("/auth/login", LoginHandler)
        api.GET("/products", GetProductsHandler)
        api.GET("/products/:id", GetProductHandler)
        api.GET("/categories", GetCategoriesHandler)
        api.GET("/categories/:id", GetCategoryHandler)
        api.GET("/landing", GetLandingPageHandler)
    }
    
    // Rutas protegidas
    protected := api.Group("")
    protected.Use(AuthMiddleware())
    {
        protected.GET("/auth/me", GetCurrentUserHandler)
        protected.POST("/sales", CreateSaleHandler)
        protected.GET("/sales", GetSalesHandler)
        protected.GET("/sales/:id", GetSaleHandler)
        protected.PATCH("/sales/:id/cancel", CancelSaleHandler)
    }
    
    // Rutas de admin
    admin := protected.Group("")
    admin.Use(AdminMiddleware())
    {
        // Productos
        admin.POST("/products", CreateProductHandler)
        admin.PUT("/products/:id", UpdateProductHandler)
        admin.DELETE("/products/:id", DeleteProductHandler)
        
        // Categorías
        admin.POST("/categories", CreateCategoryHandler)
        admin.PUT("/categories/:id", UpdateCategoryHandler)
        admin.DELETE("/categories/:id", DeleteCategoryHandler)
        
        // Ventas
        admin.PATCH("/sales/:id/status", UpdateSaleStatusHandler)
        
        // Landing
        admin.PUT("/landing", UpdateLandingPageHandler)
        admin.GET("/landing/sections", GetLandingSectionsHandler)
        admin.POST("/landing/sections", CreateLandingSectionHandler)
        admin.PUT("/landing/sections/:id", UpdateLandingSectionHandler)
        admin.DELETE("/landing/sections/:id", DeleteLandingSectionHandler)
    }
    
    // Iniciar servidor
    port := os.Getenv("PORT")
    if port == "" {
        port = "3001"
    }
    
    log.Printf("Servidor iniciado en puerto %s", port)
    r.Run(":" + port)
}
```

### Variables de Entorno
Crear archivo `.env`:
```
PORT=3001
JWT_SECRET=tu_secret_key_super_segura_de_al_menos_32_caracteres
DB_PATH=./database.db
```

---

## 📝 Notas Importantes

1. **UUIDs:** Usar `github.com/google/uuid` para generar IDs únicos
2. **Hashing de contraseñas:** Usar `golang.org/x/crypto/bcrypt` con cost 10
3. **Validación:** Validar todos los inputs antes de procesarlos
4. **Transacciones:** Usar transacciones SQL para operaciones que involucren múltiples queries (ej: crear venta con items)
5. **Timestamps:** Usar `time.Now()` para `created_at` y `updated_at`
6. **Joins:** Cuando se requiera, hacer JOINs para incluir datos relacionados (ej: productos con categorías)
7. **Ordenamiento:** Las secciones de landing deben ordenarse por el campo `order`
8. **Filtros:** Filtrar secciones de landing por `visible = true` en GET /landing

---

## ✅ Checklist de Implementación

- [ ] Configurar proyecto Go con dependencias
- [ ] Crear esquema de base de datos SQLite3
- [ ] Implementar modelos de datos
- [ ] Implementar funciones de base de datos (CRUD)
- [ ] Implementar autenticación JWT
- [ ] Implementar middleware (Auth, Admin, CORS)
- [ ] Implementar handlers de autenticación
- [ ] Implementar handlers de productos
- [ ] Implementar handlers de categorías
- [ ] Implementar handlers de ventas
- [ ] Implementar handlers de landing page
- [ ] Configurar rutas en main.go
- [ ] Probar todos los endpoints
- [ ] Manejar errores apropiadamente
- [ ] Validar inputs
- [ ] Implementar transacciones donde sea necesario

---

## 🚀 Comandos Útiles

```bash
# Inicializar módulo Go
go mod init backend

# Instalar dependencias
go mod tidy

# Ejecutar servidor
go run main.go

# Compilar
go build -o backend main.go

# Ejecutar binario
./backend
```

---

**¡Listo para implementar!** Este documento contiene toda la información necesaria para crear el backend completo que el frontend necesita.
