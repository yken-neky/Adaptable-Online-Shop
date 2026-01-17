-- Script SQL para poblar la base de datos con datos de prueba
-- Ejecutar este script después de crear las tablas

-- Insertar categorías
INSERT INTO categories (id, name, description, image, created_at, updated_at) VALUES
('1', 'Electrónica', 'Dispositivos electrónicos y tecnología de última generación', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800', datetime('now'), datetime('now')),
('2', 'Ropa y Moda', 'Ropa, calzado y accesorios de moda', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', datetime('now'), datetime('now')),
('3', 'Hogar y Jardín', 'Artículos para el hogar y jardín', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', datetime('now'), datetime('now')),
('4', 'Deportes', 'Equipamiento deportivo y fitness', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', datetime('now'), datetime('now'));

-- Insertar productos
-- Electrónica
INSERT INTO products (id, name, description, price, image, category_id, stock, created_at, updated_at) VALUES
('1', 'Smartphone Pro Max', 'El smartphone más avanzado con pantalla de 6.7 pulgadas, cámara de 108MP y procesador de última generación. Incluye carga rápida y resistencia al agua.', 899.99, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', '1', 15, datetime('now'), datetime('now')),
('2', 'Laptop Ultrabook', 'Laptop ligera y potente con procesador Intel i7, 16GB RAM, SSD de 512GB y pantalla Full HD de 14 pulgadas. Perfecta para trabajo y entretenimiento.', 1299.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', '1', 8, datetime('now'), datetime('now')),
('3', 'Auriculares Inalámbricos', 'Auriculares con cancelación de ruido activa, batería de 30 horas y calidad de sonido Hi-Fi. Incluyen estuche de carga.', 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', '1', 25, datetime('now'), datetime('now')),
('4', 'Smartwatch Fitness', 'Reloj inteligente con monitor de frecuencia cardíaca, GPS integrado, resistencia al agua y batería de 7 días.', 249.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', '1', 20, datetime('now'), datetime('now'));

-- Ropa y Moda
INSERT INTO products (id, name, description, price, image, category_id, stock, created_at, updated_at) VALUES
('5', 'Chaqueta de Cuero', 'Chaqueta de cuero genuino con forro interior, diseño clásico y atemporal. Disponible en varios colores.', 299.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', '2', 12, datetime('now'), datetime('now')),
('6', 'Zapatillas Deportivas', 'Zapatillas cómodas y resistentes con tecnología de amortiguación avanzada. Ideales para correr y caminar.', 89.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', '2', 30, datetime('now'), datetime('now')),
('7', 'Vestido Elegante', 'Vestido elegante para ocasiones especiales, hecho con materiales de alta calidad y diseño moderno.', 149.99, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', '2', 18, datetime('now'), datetime('now'));

-- Hogar y Jardín
INSERT INTO products (id, name, description, price, image, category_id, stock, created_at, updated_at) VALUES
('8', 'Set de Ollas Premium', 'Set completo de ollas y sartenes antiadherentes de acero inoxidable. Incluye 10 piezas.', 179.99, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', '3', 10, datetime('now'), datetime('now')),
('9', 'Aspiradora Robot', 'Aspiradora robot inteligente con mapeo de habitaciones, control por app y programación automática.', 399.99, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800', '3', 6, datetime('now'), datetime('now')),
('10', 'Mesa de Comedor', 'Mesa de comedor de madera maciza con capacidad para 6 personas. Diseño moderno y elegante.', 599.99, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', '3', 4, datetime('now'), datetime('now'));

-- Deportes
INSERT INTO products (id, name, description, price, image, category_id, stock, created_at, updated_at) VALUES
('11', 'Bicicleta de Montaña', 'Bicicleta de montaña con suspensión delantera, frenos de disco y 21 velocidades. Perfecta para terrenos difíciles.', 549.99, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800', '4', 7, datetime('now'), datetime('now')),
('12', 'Set de Pesas Ajustables', 'Set de pesas ajustables de 2.5kg a 25kg cada una. Incluye barra y discos intercambiables.', 199.99, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', '4', 15, datetime('now'), datetime('now'));

-- Insertar configuración de landing page
INSERT INTO landing_config (key, value) VALUES
('company_name', 'Tienda Online Demo'),
('company_description', 'Tu tienda personalizable para todo tipo de negocio. Descubre productos de calidad y servicio excepcional.'),
('logo', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200');

-- Insertar secciones de landing page
INSERT INTO landing_sections (id, type, title, content, image, "order", visible) VALUES
('1', 'hero', 'Bienvenido a nuestra tienda', 'Descubre productos de calidad con los mejores precios del mercado', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200', 1, 1),
('2', 'about', 'Sobre Nosotros', 'Somos una tienda comprometida con la calidad y el servicio al cliente. Ofrecemos una amplia variedad de productos cuidadosamente seleccionados para satisfacer todas tus necesidades. Nuestro equipo está dedicado a brindarte la mejor experiencia de compra posible.', NULL, 2, 1),
('3', 'features', '¿Por qué elegirnos?', '✓ Productos de calidad garantizada
✓ Envío rápido y seguro
✓ Atención al cliente 24/7
✓ Precios competitivos
✓ Devoluciones sin complicaciones', NULL, 3, 1),
('4', 'testimonials', 'Lo que dicen nuestros clientes', '"Excelente servicio y productos de calidad. Muy recomendado!" - María G.

"La mejor experiencia de compra online que he tenido." - Juan P.

"Productos excelentes y entrega rápida. Volveré a comprar." - Ana L.', NULL, 4, 1),
('5', 'contact', 'Contáctanos', '¿Tienes alguna pregunta? Estamos aquí para ayudarte.

Email: contacto@tiendaonline.com
Teléfono: +1 (555) 123-4567
Horario: Lunes a Viernes 9:00 AM - 6:00 PM', NULL, 5, 1);
