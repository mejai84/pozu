# Auditoría Técnica 2026 - POZU 2.0

## 📊 Estado Actual del Proyecto (Pre-Modularización)

| Módulo | Archivo Principal | Líneas | Estado | Riesgo |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | `admin/page.tsx` | 6 | ✅ Optimizado | Bajo |
| **KDS (Cocina)** | `admin/kitchen/page.tsx` | 6 | ✅ Optimizado | Bajo |
| **Monitor** | `admin/realtime-monitor/page.tsx` | 5 | ✅ Optimizado | Bajo |
| **Clientes/CRM** | `admin/customers/page.tsx` | 6 | ✅ Optimizado | Bajo |
| **Productos** | `admin/products/page.tsx` | 6 | ✅ Optimizado | Bajo |
| **Reportes** | `admin/reports/page.tsx` | 8 | ✅ Optimizado | Bajo |
| **Configuración** | `admin/settings/page.tsx` | 5 | ✅ Optimizado | Bajo |
| **Reparto** | `admin/delivery/page.tsx` | 5 | ✅ Optimizado | Bajo |
| **Comandas** | `admin/orders/page.tsx` | 5 | ✅ Optimizado | Bajo |
| **Cupones** | `admin/coupons/page.tsx` | 5 | ✅ Optimizado | Bajo |
| **Personal** | `admin/employees/page.tsx` | 5 | ✅ Optimizado | Bajo |
| **Reservas** | `admin/reservations/page.tsx` | 5 | ✅ Optimizado | Bajo |

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

## 📝 Notas de Implementación
- Se mantendrá el uso de **Tailwind CSS** y **Vanilla CSS** según las guías.
- Se dará prioridad a la estética "Premium" y animaciones con **Framer Motion**.
- **Supabase** seguirá siendo el cerebro central (Store + Realtime).

---
*Última actualización: 15 Marzo 2026*
