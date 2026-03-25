# 🍔 POZU 2.0 - Sistema de Gestión de Restaurante

Sistema completo de pedidos online y gestión administrativa para restaurante de hamburguesas artesanales en Asturias.

![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Módulos Principales](#-módulos-principales)
- [Base de Datos](#-base-de-datos)
- [Deployment](#-deployment)

---

## ✨ Características

### Para Clientes:
- 🛒 Catálogo completo de productos
- 🛍️ Carrito de compras con localStorage
- 💳 Checkout con información de contacto
- 📱 Diseño completamente responsive
- 📅 **Reservas Online** con confirmación automática
- 📝 **Personalización de Productos** (notas sobre ingredientes, puntos de carne, etc.)
- 📍 **Tracking de Pedidos en Tiempo Real** (tipo Uber Eats)
- 🎨 UI moderna con animaciones de alto impacto

### Para Administradores y Staff:
- 📊 **Dashboard** con métricas en tiempo real
- 🛒 **Gestión de Pedidos** con auto-envío a cocina para pagos web
- 🚲 **Módulo de Reparto PWA** con GPS, captura de firmas digitales y reporte fotográfico de incidencias
- 👨‍🍳 **KDS (Kitchen Display System)** con notificaciones visuales y sonoras
- 🍔 **Gestión de Productos** con control de stock y alérgenos
- 👥 **Gestión de Clientes** con historial de consumo
- 👨‍💼 **Gestión de Empleados** con roles granulares (7 roles específicos)
- 💳 **Auditoría de Pagos Stripe** (ID de cargo, marca de tarjeta, recibos)
- 📈 **Reportes** con exportación a múltiples formatos
- ⚙️ **Configuración Business** (Horarios, Delivery fee, Estado local)
- 🔔 **Notificaciones Pro** en tiempo real (Suscripción Supabase)

---

## 🛠️ Stack Tecnológico

### Frontend:
- **Next.js 16.1.3** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** (componentes)
- **Lucide Icons**

### Backend:
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Row Level Security (RLS)**

### Deployment:
- **Dokploy / VPS (Recomendado)**: Utilizando el `Dockerfile` optimizado y modo `standalone`.
- **Vercel**: Despliegue serverless tradicional.
- **Supabase Cloud**: Backend e infraestructura de datos.

---

## 📦 Instalación

### Prerrequisitos:
- Node.js 18.x o superior
- npm o yarn
- Cuenta de Supabase

### Pasos:

1. **Clonar el repositorio:**
```bash
git clone https://github.com/mejai84/pozu.git
cd pozu
```

2. **Instalar dependencias:**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno:**
Crear archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Ejecutar migraciones de base de datos:**
- Ir a Supabase Dashboard > SQL Editor
- Ejecutar los scripts en `/supabase_migrations/`

5. **Ejecutar en desarrollo:**
```bash
npm run dev
# o
yarn dev
```

6. **Abrir en navegador:**
```
http://localhost:3000
```

---

## ⚙️ Configuración

### Supabase Setup:

1. **Crear proyecto** en [Supabase](https://supabase.com)

2. **Ejecutar migraciones:**
   - `create_products_table.sql`
   - `create_orders_table.sql`
   - `create_profiles_table.sql`
   - `create_settings_table.sql` ⭐ NUEVO

3. **Configurar autenticación:**
   - Habilitar Email Auth
   - Configurar políticas RLS

4. **Crear usuario admin:**
```sql
-- Registrar usuario en el panel de auth
-- Luego actualizar su rol:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'tu_email@ejemplo.com';
```

### Acceso al Panel Admin:

1. Ir a `/login`
2. Iniciar sesión con usuario admin
3. Acceder a `/admin`

**Usuario demo:**
- Disponible bajo petición al administrador.

---

## 📁 Estructura del Proyecto

```
├── src/
│   ├── ...
├── scripts/                    ⭐ NUEVO (Scripts de utilidad)
├── public/
├── ...
└── package.json

```

---

## 🎯 Módulos Principales

### 1. Dashboard (`/admin`)
- Métricas en tiempo real
- Gráficos de ingresos semanales
- Top productos del día
- Comparación vs día anterior
- Tarjetas interactivas

### 2. Gestión de Pedidos (`/admin/orders`)
- Vista completa de pedidos
- Filtrado por estado
- Creación manual de pedidos
- Actualización de estados
- Vista detallada

### 3. KDS - Sistema de Cocina (`/admin/kitchen`)
- Vista optimizada para cocina
- Pedidos en tiempo real
- Actualización rápida de estados
- Notificaciones sonoras

### 4. Gestión de Productos (`/admin/products`)
- CRUD completo
- Upload de imágenes
- Categorización
- Productos archivados

### 5. Reportes (`/admin/reports`) ⭐ NUEVO
- Análisis por período
- Top productos
- Ingresos diarios
- Exportación CSV/PDF

### 6. Configuración (`/admin/settings`) ⭐ MEJORADO
- Información del negocio
- Horarios de atención
- Configuración de delivery
- Estado abierto/cerrado
- Integración Instagram (UI)

### 7. Notificaciones ⭐ NUEVO
- Tiempo real con Supabase
- Push notifications
- Sonido de alerta
- Contador de no leídas

---

## 🗄️ Base de Datos

### Tablas Principales:

#### `products`
```sql
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- price (NUMERIC)
- category (TEXT)
- image_url (TEXT)
- available (BOOLEAN)
- created_at (TIMESTAMP)
```

#### `orders`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- guest_info (JSONB)
- subtotal (NUMERIC) -- ⭐ NUEVO
- tax_amount (NUMERIC) -- ⭐ NUEVO
- delivery_fee (NUMERIC) -- ⭐ NUEVO
- total (NUMERIC)
- status (TEXT) -- pending, confirmed, preparing, ready, out_for_delivery, delivered
- payment_method (TEXT) -- cash, stripe, card
- payment_status (TEXT) -- pending, paid
- stripe_payment_id (TEXT)
- stripe_charge_id (TEXT)
- stripe_receipt_url (TEXT)
- card_brand (TEXT)
- card_last4 (TEXT)
- source (TEXT) -- web, whatsapp, telegram, phone
- created_at (TIMESTAMP)
```

#### `profiles`
```sql
- id (UUID, PK → auth.users)
- email (TEXT)
- full_name (TEXT)
- phone (TEXT)
- role (TEXT) -- admin, staff, customer
```

#### `settings` ⭐ NUEVO
```sql
- id (UUID, PK)
- key (TEXT, UNIQUE)
- value (JSONB)
- updated_at (TIMESTAMP)
```

#### `error_logs` ⭐ NUEVO
```sql
- id (UUID, PK)
- node_name (TEXT)
- error_message (TEXT)
- workflow_id (TEXT)
- item_data (JSONB)
- created_at (TIMESTAMPTZ)
```

### Políticas RLS:

- **Products**: Lectura pública, escritura solo admin
- **Orders**: Usuarios ven sus pedidos, admin ve todos
- **Profiles**: Usuarios ven su perfil, admin ve todos
- **Settings**: Lectura pública, escritura solo admin

---

## 🚀 Deployment

### Dokploy / VPS (Recomendado):

1. **Conectar repositorio** en Dokploy.
2. **Configurar Build Type** como `Dockerfile`.
3. **Activar "Create Environment File"** en la configuración de Dokploy.
4. **Configurar variables de entorno** (`NEXT_PUBLIC_SUPABASE_URL`, etc.).
5. **Añadir Dominio** apuntando al puerto `3000`.

### Vercel:

1. **Conectar repositorio** en Vercel
2. **Configurar variables de entorno:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. **Deploy automático** en cada push a main (rama principal)

### Supabase:

1. Proyecto ya configurado
2. Ejecutar migraciones si es necesario
3. Verificar políticas RLS

---

## 📱 URLs Principales

- **Home:** `/`
- **Menú:** `/menu`
- **Checkout:** `/checkout`
- **Login:** `/login`
- **Admin Dashboard:** `/admin`
- **Reportes:** `/admin/reports`

---

## 🔐 Roles y Permisos

### Admin:
- Acceso total al panel y métricas financieras
- Gestión de productos y categorías
- Gestión de empleados y roles

### Manager:
- Gestión operativa completa (pedidos, productos, reservas)
- Control de stock y alérgenos

### Kitchen:
- Acceso exclusivo al KDS (Kitchen Display System)
- Marcación de stock agotado

### Cashier:
- Gestión de pedidos y cobranza
- Sin acceso a reportes financieros de alto nivel

### Delivery:
- Gestión de despachos y estados de repartidor

### Waiter:
- Toma de pedidos y gestión de mesas

### Customer:
- Ver y hacer pedidos
- Ver historial propio

---

## 📝 TODO / Próximas Mejoras

- [ ] Gráficos avanzados con Chart.js
- [ ] Integración real con Instagram API
- [ ] Sistema de inventario
- [ ] Notificaciones por email
- [ ] Programa de fidelización
- [ ] Multi-idioma (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Pagos online (Stripe/PayPal)

---

## 🧪 Aseguramiento de Calidad y Pruebas (QA)

El proyecto cuenta con una hoja de ruta de pruebas (Testing Roadmap) exhaustiva diseñada para prevenir fallas financieras y alucinaciones en el sistema omnicanal.

Para ver los casos de prueba End-to-End, Edge Cases y validaciones de la pasarela de Stripe, revisa el documento: 
👉 [TESTING_ROADMAP_POZU_2.0.md](./TESTING_ROADMAP_POZU_2.0.md)

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## 📄 Licencia

Este proyecto es privado y pertenece a Pozu Hamburguesas.

---

## 👨‍💻 Autor

**Jaime** - [mejai84](https://github.com/mejai84)

---

## 📞 Contacto

- **Web:** [Pozu Hamburguesas](https://pozu.vercel.app)
- **Email:** info@pozu.com
- **Ubicación:** C. Río Cares, 2, Pola de Laviana, Asturias

---

## 🎉 Estado del Proyecto

✅ **COMPLETADO Y FUNCIONAL**

- [x] Frontend de tienda Rock & Burger
- [x] Panel de administración completo (7 roles)
- [x] Sistema de pedidos y personalización
- [x] Gestión de productos con alérgenos y multimedia
- [x] Gestión de seguridad granular (RBAC) sin recursión
- [x] Reportes y analytics protegidos
- [x] Notificaciones en tiempo real
- [x] Configuración persistente
- [x] Exportación de datos
- [x] **Actualización de Carta** (22+ productos sincronizados)
- [x] **Ubicación Satelital 3D** (Precision Pointing)
- [x] **Gestión CRUD de Auth** (Editar/Eliminar empleados)

**Versión:** 3.2 (Multimodal AI Deployment)
**Última actualización:** 25 Marzo 2026 - 03:30  
**Estado:** ✅ Producción Live (VPS / Dokploy) 🚀 - Build Stable Resilient - Pozu AI Multimodal (Vision & Audio) - Persistence Chat Memory (Postgres) - Automatic Customer Risk Scoring.


---

*Desarrollado con ❤️ para Pozu Hamburguesas*
