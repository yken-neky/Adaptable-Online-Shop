# Script de Datos de Prueba (Seed Data)

Este script SQL contiene todos los datos de prueba necesarios para poblar la base de datos del backend.

## 📋 Contenido del Script

El script `seed_data.sql` incluye:

- **4 Categorías**: Electrónica, Ropa y Moda, Hogar y Jardín, Deportes
- **12 Productos**: Distribuidos entre las categorías con imágenes, descripciones y precios
- **Configuración de Landing Page**: Nombre de empresa, descripción y logo
- **5 Secciones de Landing Page**: Hero, Sobre Nosotros, Características, Testimonios, Contacto

## 🚀 Cómo Ejecutar el Script

### Opción 1: Desde la línea de comandos (SQLite3)

```bash
# Si estás en el directorio del backend
sqlite3 database.db < seed_data.sql

# O desde la raíz del proyecto
sqlite3 backend/database.db < backend/seed_data.sql
```

### Opción 2: Desde el código Go

Puedes crear una función en tu backend Go para ejecutar el script:

```go
func SeedDatabase(db *sql.DB) error {
    seedSQL, err := os.ReadFile("seed_data.sql")
    if err != nil {
        return err
    }
    
    _, err = db.Exec(string(seedSQL))
    return err
}
```

### Opción 3: Desde un cliente SQL

Abre `database.db` con cualquier cliente SQL (DB Browser for SQLite, etc.) y ejecuta el contenido del archivo `seed_data.sql`.

## ⚠️ Notas Importantes

1. **Ejecutar después de crear las tablas**: Asegúrate de que las tablas estén creadas antes de ejecutar este script.

2. **IDs fijos**: Los IDs usados son "1", "2", "3", etc. Si tu backend genera UUIDs automáticamente, necesitarás modificar el script para usar UUIDs o ajustar tu código para aceptar estos IDs.

3. **Imágenes**: Las imágenes son URLs de Unsplash. En producción, deberías usar tus propias imágenes.

4. **Datos de prueba**: Estos son datos de demostración. En producción, deberías eliminar o reemplazar estos datos.

## 📝 Estructura de Datos

### Categorías
- ID: 1-4
- Cada categoría tiene nombre, descripción e imagen

### Productos
- ID: 1-12
- Distribuidos en las 4 categorías
- Cada producto tiene: nombre, descripción, precio, imagen, stock

### Landing Page
- Configuración de empresa (nombre, descripción, logo)
- 5 secciones ordenadas y visibles

## 🔄 Re-ejecutar el Script

Si necesitas re-ejecutar el script (por ejemplo, después de limpiar la base de datos), puedes:

1. Eliminar los datos existentes primero
2. O usar `INSERT OR REPLACE` en lugar de `INSERT` (modificar el script)

## ✅ Verificar que Funcionó

Después de ejecutar el script, puedes verificar:

```sql
-- Verificar categorías
SELECT COUNT(*) FROM categories; -- Debe ser 4

-- Verificar productos
SELECT COUNT(*) FROM products; -- Debe ser 12

-- Verificar secciones de landing
SELECT COUNT(*) FROM landing_sections; -- Debe ser 5
```
