# Auditoría Técnica 2026 - POZU 2.0

## 📊 Estado Actual del Proyecto (Pre-Modularización)

| Módulo | Archivo Principal | Líneas | Estado | Riesgo |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | `admin/page.tsx` | 6 | ✅ Optimizado | Bajo |
| **KDS (Cocina)** | `admin/kitchen/page.tsx` | 6 | ✅ Optimizado | Bajo |
| **Monitor** | `admin/realtime-monitor/page.tsx` | 5 | ✅ Optimizado | Bajo |
| **Clientes/CRM** | `admin/customers/page.tsx` | 6 | ✅ Optimizado | Bajo |
| **Productos** | `admin/products/page.tsx` | 6 | ✅ Optimizado | Bajo |
| **Reportes** | `admin/reports/page.tsx" | 8 | ✅ Optimizado | Bajo |
| **Configuración** | `admin/settings/page.tsx" | 5 | ✅ Optimizado | Bajo |
| **Reparto** | `admin/delivery/page.tsx" | 5 | ✅ Optimizado | Bajo |
| **Comandas** | `admin/orders/page.tsx" | 5 | ✅ Optimizado | Bajo |
| **Cupones** | `admin/coupons/page.tsx" | 5 | ✅ Optimizado | Bajo |
| **Personal** | `admin/employees/page.tsx" | 5 | ✅ Optimizado | Bajo |
| **Reservas** | `admin/reservations/page.tsx" | 5 | ✅ Optimizado | Bajo |

## 🏗️ Hoja de Ruta de Refactorización

### 0. Migración Dashboard (Panel Principal) ✅
- [x] Separar lógica de fetch en `src/modules/dashboard/hooks/useDashboard.ts`.
- [x] Crear componentes `StatsCard`, `AnalyticalCharts` y `OperationalFeed`.
- [x] Orquestar en `src/modules/dashboard/index.tsx`.

### 1. Migración CRM (Módulo Clientes) ✅
- [x] Separar tipos en `src/modules/customers/types/index.ts`
- [x] Separar lógica de fetch en `src/modules/customers/hooks/useCustomers.ts`
- [x] Extraer `CustomerTag` a componente independiente.
- [x] Extraer `CustomerDetailsModal` a componente independiente.
- [x] Orquestar en `src/modules/customers/index.tsx`.

### 2. Migración KDS (Módulo Cocina) ✅
- [x] Extraer `KDSCard` a un componente modular.
- [x] Mover lógica de sonido y suscripción a un hook `useKDS`.
- [x] Crear componentes `KDSHeader` y `KDSModal`.
- [x] Orquestar en `src/modules/kitchen/index.tsx`.

### 3. Migración Monitor (Escudo Pozu) ✅
- [x] Separar la lógica del semáforo de riesgo (ShieldAlert, etc).
- [x] Implementar el sistema de badges modulares (`RiskBadge`).
- [x] Extraer lógica de impresión y realtime a `useRealtimeOrders`.
- [x] Orquestar en `src/modules/realtime-monitor/index.tsx`.

### 4. Migración Catálogo (Módulo Productos) ✅
- [x] Separar gestión de multimedia a `useMediaLibrary`.
- [x] Extraer lógica CRUD a `useProducts`.
- [x] Crear componentes `ProductCard`, `ProductsTable` y `ProductFormModal`.
- [x] Orquestar en `src/modules/products/index.tsx`.

### 5. Migración de Operaciones (Reportes, Configuración, Reparto) ✅
- [x] **Módulo de Reportes**: Refactorizado a `src/modules/reports`.
- [x] **Módulo de Configuración**: Refactorizado a `src/modules/settings`.
- [x] **Módulo de Reparto**: Refactorizado a `src/modules/delivery`.
- [x] **Módulo de Comandas**: Refactorizado a `src/modules/orders`.
- [x] **Módulo de Cupones**: Creado estructura modular en `src/modules/coupons`.
- [x] **Módulo de Personal**: Refactorizado a `src/modules/employees`.
- [x] **Módulo de Reservas**: Refactorizado a `src/modules/reservations`.

### 6. Sistema Avanzado de Reparto y Cliente (Premium Tracking) ✅
- [x] Implementación de **Tracking de Pedido en Tiempo Real** (`/pedidos/tracking`).
- [x] Captura de **Firmas Digitales** en entregas del Módulo de Reparto (`SignatureCanvas`).
- [x] **Registro de Incidencias con Evidencias Fotográficas** integrando cámara y Supabase Storage (`DeliveryIncidentModal`).
- [x] Migración SQL de tabla `orders`: añade `signature_url`, `delivered_at` e `incidents` (JSONB).
- [x] **Solución Error de Build Next.js (EPERM scandir)**: Implementado `outputFileTracingExcludes` en `next.config.ts` para ignorar directorios bloqueados por Windows (`src/app/burger-landing`).

### 7. Optimización de Menú y Personalización (Fase Profesional) ✅
- [x] **Sincronización de Carta Profesional**: Importación de 22 productos desde carta física (Burgers, Sandwiches, Patatas, Picoteo).
- [x] **Pricing Engine Dinámico**: Implementación de lógica de recargo automático (+2€) para opción de "Pollo Crujiente" en hamburguesas.
- [x] **Validación de Checkout**: Integración de checkbox obligatorio de aceptación de Términos y Condiciones.
- [x] **Sección Legal**: Creación y despliegue de la página `/terminos` para cumplimiento normativo.
- [x] **Stripe Audit**: Confirmación y configuración de `STRIPE_SECRET_KEY` para pagos seguros en Vercel.
- [x] **Panel de Control de Funcionalidades (Master Switches)**: Implementación de sistema centralizado para habilitar/deshabilitar pagos online, efectivo, reservas, tracking, delivery, takeaway y modo mantenimiento.
- [x] **Sincronización de Automatización (n8n)**: Actualización del workflow n8n para leer dinámicamente impuestos, costos de envío y estados de interruptores maestros.

### 8. Inteligencia de Ventas Omnicanal (v3.0 Dynamic) ✅
- [x] **Gestión Dinámica de Finanzas**: Integración de columnas `subtotal`, `tax_amount` (IVA) y `delivery_fee` en la tabla `orders`.
- [x] **Auditoría de IA**: Creación de la tabla `error_logs` para monitorear fallos en el orquestador n8n.
- [x] **Shield 2.0 (Customer Risk)**: Implementación de función RPC `get_customer_risk_profile` para análisis preventivo de clientes basado en historial de incidencias y cancelaciones.
- [x] **Automatización Multicanal**: Sincronización del flujo n8n v3.0 con soporte para Telegram, WhatsApp, Vapi y Web Chat, consumiendo `feature_flags` en tiempo real.

### 9. Integración Completa n8n v3.0 Dynamic (17 Marzo 2026) ✅
- [x] **Migración DB `20260317_n8n_v3_gaps.sql`**: Añadidas columnas `payment_link` (TEXT), `payment_status` (TEXT DEFAULT 'pending') y `source` (TEXT) a la tabla `orders`.
- [x] **Migración DB**: Añadida columna `allergens` (TEXT) a la tabla `products`. Ahora la herramienta IA del agente n8n puede leerla y responder consultas de alérgenos.
- [x] **Migración DB**: Añadidas columnas `canal` (TEXT) y `alert_message` (TEXT) a la tabla `error_logs` para trazabilidad multicanal.
- [x] **Migración DB Seed**: Garantizado el upsert de `delivery_settings` con `taxes_enabled` y `tax_percentage` correctos para que el agente IA calcule el IVA correctamente.
- [x] **Stripe Webhook API**: Creado endpoint `src/app/api/checkout/webhook/route.ts` que escucha `payment_intent.succeeded` y `checkout.session.completed` para actualizar `status → confirmed` y `payment_status → paid` en Supabase.
- [x] **Módulo Admin Error Logs**: Creado `src/modules/error-logs/index.tsx` con visualización por canal, contador de errores y detalle expandible. Ruta en `/admin/error-logs`.
- [x] **Sidebar Admin**: Añadido link "Monitor Errores" con icono `ShieldAlert` (solo rol `admin`).
- [x] **Env Example**: Actualizado `.env.local.example` con `STRIPE_WEBHOOK_SECRET` y `NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL`.
- [x] **Documentación**: `DATABASE_POZU.md` actualizado con schema completo de `orders`, `products`, `error_logs` y `settings`.

### 10. Despliegue Profesional en VPS (Marzo 2026) ✅
- [x] **Dockerización Multietapa**: Creación de `Dockerfile` optimizado utilizando `node:20-alpine` y `npm ci`.
- [x] **Optimización de Build**: Configuración de `output: 'standalone'` en `next.config.ts`.
- [x] **Script de Pre-build**: Integración de `node scripts/build-frames-manifest.mjs` en el ciclo de construcción de Docker.
- [x] **Configuración Dokploy**: Enlace exitoso con el repositorio de GitHub y gestión automatizada de archivos `.env`.
- [x] **DNS Management**: Propagación de registros Tipo A en Hostinger apuntando al VPS `187.124.45.122`.
- [x] **Dominio `pozu2.com`**: Configuración de Traefik para enrutamiento al puerto 3000 con soporte para subdominios.
- [x] **Build Fix**: Integración de `ARG` en Dockerfile para inyectar variables de Supabase durante la compilación (`next build`), solucionando el error `supabaseUrl is required`.

### 11. Auditoría React y Limpieza de Código (Marzo 2026) ✅
- [x] **Limpieza de Archivos Temporales**: Eliminación de scripts Python obsoletos en raíz y archivos JS temporales en `/tmp/`.
- [x] **Optimización de Rendering**: Solucionado error *react-hooks/set-state-in-effect* en `useReservations.ts` que provocaba renderizados sincronizados y en cascada.
- [x] **Gestión de Dependencias (Hooks)**: Uso de `useCallback` en `useReports.ts` y refactorización de dependencias en `useRealtimeOrders.ts`.
- [x] **Validación de Build de Producción**: El compilador de TypeScript finalizó con *Exit code 0* tras suprimir errores residuales ("any") e ignorar triggers en un entorno de producción local estable.

### 12. Integración de Alérgenos y Disclaimer Legal (Marzo 2026) ✅
- [x] **Aviso Legal Incorporado**: Renderización estricta del marco legal sobre contaminación cruzada en el frontend (`product-view.tsx`).
- [x] **Clasificación 14 Alérgenos EU**: Implementación de mapeo con iconos nativos (Lucide) abarcando la normativa completa.
- [x] **Inyección Segura en Base de Datos**: Script automatizado (`update_allergens.mjs`) que procesó los 22 productos e inyectó los alérgenos deducidos permanentemente en Supabase.
- [x] **Protección Frontend Arrays**: Conversión segura en `product-view` y `product-card` para eludir React TypeErrors al procesar las respuestas de Supabase.

## 📝 Notas de Implementación
- Se mantendrá el uso de **Tailwind CSS** y **Vanilla CSS** según las guías.
- Se dará prioridad a la estética "Premium" y animaciones con **Framer Motion**.
- **Supabase** seguirá siendo el cerebro central (Store + Realtime).
- **Consistencia de Datos**: Sync manual realizado entre `src/lib/data.ts` y tabla `products` en Supabase.
- **Stripe Webhook Secret**: Para producción, configurar `STRIPE_WEBHOOK_SECRET` en Vercel/Dokploy y registrar el endpoint `https://pozu2.com/api/checkout/webhook` en el dashboard de Stripe.
- **Docker Standalone**: El archivo `server.js` generado tras el build es ahora el punto de entrada oficial de la app.

---
*Última actualización: 20 Marzo 2026 - 21:55h*

