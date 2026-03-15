# Auditoría Técnica 2026 - POZU 2.0

## 📊 Estado Actual del Proyecto (Pre-Modularización)

| Módulo | Archivo Principal | Líneas | Estado | Riesgo |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | `admin/page.tsx` | ~600 | Acoplado | Medio |
| **KDS (Cocina)** | `admin/kitchen/page.tsx` | ~450 | Monolítico | Alto |
| **Monitor** | `admin/realtime-monitor/page.tsx` | ~500 | Monolítico | Alto |
| **Clientes/CRM** | `admin/customers/page.tsx` | 6 | ✅ Optimizado | Bajo |
| **Productos** | `admin/products/page.tsx` | ~400 | Acoplado | Medio |

## 🏗️ Hoja de Ruta de Refactorización

### 1. Migración CRM (Módulo Clientes) ✅
- [x] Separar tipos en `src/modules/customers/types/index.ts`
- [x] Separar lógica de fetch en `src/modules/customers/hooks/useCustomers.ts`
- [x] Extraer `CustomerTag` a componente independiente.
- [x] Extraer `CustomerDetailsModal` a componente independiente.
- [x] Orquestar en `src/modules/customers/index.tsx`.

### 2. Migración KDS (Módulo Cocina) 👨‍🍳
- [ ] Extraer `KDSCard` a un componente modular.
- [ ] Mover lógica de sonido y suscripción a un hook `useKDS`.

### 3. Migración Monitor (Escudo Pozu) 🛡️
- [ ] Separar la lógica del semáforo de riesgo (ShieldAlert, etc).
- [ ] Implementar el sistema de badges modulares.

## 📝 Notas de Implementación
- Se mantendrá el uso de **Tailwind CSS** y **Vanilla CSS** según las guías.
- Se dará prioridad a la estética "Premium" y animaciones con **Framer Motion**.
- **Supabase** seguirá siendo el cerebro central (Store + Realtime).

---
*Última actualización: 15 Marzo 2026*
