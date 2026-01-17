# 🎮 Modo Demo - Datos de Demostración

**Nota:** Los datos mock han sido eliminados. La aplicación ahora requiere que el backend esté disponible para funcionar.

Para usar datos de prueba, ejecuta el script SQL `backend/seed_data.sql` en tu base de datos del backend.

## 📦 Datos de demostración incluidos

### Categorías (4 categorías)
1. **Electrónica** - Dispositivos y tecnología
2. **Ropa y Moda** - Ropa, calzado y accesorios
3. **Hogar y Jardín** - Artículos para el hogar
4. **Deportes** - Equipamiento deportivo

### Productos (12 productos)
- Smartphone Pro Max - $899.99
- Laptop Ultrabook - $1,299.99
- Auriculares Inalámbricos - $199.99
- Smartwatch Fitness - $249.99
- Chaqueta de Cuero - $299.99
- Zapatillas Deportivas - $89.99
- Vestido Elegante - $149.99
- Set de Ollas Premium - $179.99
- Aspiradora Robot - $399.99
- Mesa de Comedor - $599.99
- Bicicleta de Montaña - $549.99
- Set de Pesas Ajustables - $199.99

### Landing Page
- Sección Hero con imagen
- Sección "Sobre Nosotros"
- Sección "Características"
- Sección "Testimonios"
- Sección "Contacto"

## 🎯 Funcionalidades que puedes probar

### Como Visitante/Cliente:
1. ✅ Ver la landing page completa con todas las secciones
2. ✅ Navegar por todas las categorías
3. ✅ Ver todos los productos organizados por categoría
4. ✅ Ver detalles de cada producto
5. ✅ Agregar productos al carrito
6. ✅ Ver el carrito de compras
7. ✅ Modificar cantidades en el carrito
8. ✅ Eliminar productos del carrito

### Nota sobre autenticación:
Las funciones de autenticación (login, registro, perfil, panel admin) requieren el backend para funcionar completamente. Sin embargo, puedes:
- Ver las páginas de login y registro
- Ver la estructura del panel de administración (requiere login)

## 🔄 Cambiar entre modo demo y backend real

### Para usar datos demo:
- No configures `NEXT_PUBLIC_API_URL`, o
- Configura `NEXT_PUBLIC_USE_MOCK_DATA=true`

### Para usar backend real:
- Configura `NEXT_PUBLIC_API_URL` con la URL de tu backend
- Asegúrate de que `NEXT_PUBLIC_USE_MOCK_DATA` no esté configurado o sea `false`

## 📝 Archivos relacionados

- `lib/mockData.ts` - Contiene todos los datos de demostración
- `lib/api.ts` - Cliente API que usa datos mock cuando el backend no está disponible

## 💡 Tips

- Los datos mock incluyen imágenes de Unsplash para una mejor experiencia visual
- Todos los productos tienen descripciones detalladas y precios realistas
- El carrito funciona completamente con datos mock (se guarda en localStorage)
- La landing page tiene contenido completo y profesional

¡Disfruta probando la aplicación! 🎉
