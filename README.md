# Adaptable Online Shop

Tienda online personalizable desarrollada con Next.js y TailwindCSS, diseñada para ser altamente configurable sin necesidad de modificar el código.

## Características

- **Landing Page Personalizable**: El administrador puede modificar todas las secciones de la landing page desde el panel de administración
- **Gestión de Productos**: Organización por categorías con gestión completa de productos
- **Sistema de Roles**: Dos roles principales (admin y cliente)
- **Carrito de Compras**: Sistema completo de carrito con persistencia local
- **Gestión de Ventas**: Los clientes crean compras (ventas) que el administrador puede gestionar
- **Panel de Administración**: Gestión completa de productos, categorías, ventas y landing page

## Tecnologías

- **Next.js 16**: Framework React con App Router
- **TypeScript**: Tipado estático
- **TailwindCSS**: Estilos utilitarios
- **Vercel Ready**: Configurado para despliegue en Vercel

## Estructura de Rutas

- `/landing` - Landing page personalizable
- `/products` - Lista de productos organizados por categorías
- `/products/:category` - Productos de una categoría específica
- `/products/:category/:id` - Detalle del producto
- `/cart` - Carrito de compras
- `/login` - Inicio de sesión
- `/register` - Registro de usuarios
- `/profile` - Perfil del usuario y sus compras
- `/admin` - Panel de administración

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (opcional):
```bash
cp .env.example .env.local
```

Editar `.env.local` y configurar la URL del backend:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Nota:** Si no configuras `NEXT_PUBLIC_API_URL`, la aplicación usará automáticamente datos de demostración (mock data) para que puedas probar todas las funcionalidades sin necesidad del backend.

3. Ejecutar en desarrollo:
```bash
npm run dev
```

4. Construir para producción:
```bash
npm run build
```

5. Iniciar en producción:
```bash
npm start
```

## Sistema de Roles

### Admin
- Modificar landing page
- Gestionar productos y categorías
- Ver y modificar estados de ventas
- Historial completo de productos, categorías y ventas

### Cliente
- Ver productos y categorías
- Agregar productos al carrito
- Realizar compras (crear ventas con estado "pendiente")
- Ver sus compras
- Cancelar compras pendientes

## Estados de Ventas

- **Pendiente**: Compra creada por el cliente, esperando contacto del administrador
- **Planificada**: Compra planificada por el administrador
- **Realizada**: Compra completada
- **Cancelada**: Compra cancelada (solo el cliente puede cancelar compras pendientes)

## API Client

El proyecto incluye un cliente API (`lib/api.ts`) que se conecta al backend. Este es un esqueleto listo para conectarse cuando el backend esté disponible. Todas las funciones están implementadas y manejan errores apropiadamente.

## Despliegue en Vercel

1. Conectar el repositorio a Vercel
2. Configurar la variable de entorno `NEXT_PUBLIC_API_URL` con la URL del backend
3. Vercel detectará automáticamente Next.js y construirá el proyecto

## Desarrollo

El proyecto está estructurado de la siguiente manera:

```
├── app/              # Rutas y páginas (App Router)
├── components/       # Componentes reutilizables
├── contexts/         # Contextos de React
├── lib/              # Utilidades y cliente API
├── types/            # Tipos TypeScript
└── public/           # Archivos estáticos
```

## Notas

- El carrito se almacena en localStorage del navegador
- La autenticación utiliza tokens almacenados en localStorage
- El backend debe implementar las APIs especificadas en `lib/api.ts`
- Todas las páginas están protegidas según el rol del usuario
