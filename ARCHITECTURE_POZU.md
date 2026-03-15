# Arquitectura Pozu 2.0: Core + Plugins

## 🚀 Filosofía de Diseño
Pozu 2.0 evoluciona hacia una estructura modular para garantizar escalabilidad, mantenibilidad y archivos de código cortos (menos de 200 líneas por componente). Inspirado en la arquitectura de JAMALI OS, cada sección del panel de administración es un "Plugin" independiente.

## 📁 Estructura de Directorios

### 1. `src/modules/` (El Motor de Plugins)
Cada funcionalidad del admin se moverá aquí.
```
src/modules/[module]/
├── components/          # Componentes específicos del módulo (Table, Modal, etc)
├── hooks/               # Lógica y fetching (useModule.ts)
├── types/               # Definiciones de TypeScript (.ts)
├── utils/               # Helpers específicos
└── index.tsx            # Componente principal (Orquestador)
```

### 2. `src/core/` (La Base Compartida)
Componentes de UI, hooks globales y utilidades de Supabase que usan todos los módulos.
- `src/core/components/ui/` (shadcn original)
- `src/core/hooks/` (useRealtime, useAuth)
- `src/core/lib/` (supabase client)

### 3. Integración Avanzada de Módulos Específicos
#### Módulo de Reparto Avanzado & Tracking Cliente
- **Tracking Cliente en Tiempo Real**: Rutas como `/pedidos/tracking` utilizan `supabase.channel` (`useRealtime`) para mostrar el estado del pedido, mapa en vivo interactivo e información de contacto del repartidor.
- **Gestión de Evidencias y Firmas**: El módulo de reparto (`src/modules/delivery`) integra soporte offline/online nativo web con `SignatureCanvas` (HTML5) para firmar entregas.
- **Supabase Storage**: 
  - `incidents-photos`: Bucket público utilizado de forma dinámica para almacenar tanto **fotos de incidencias** en ruta, como **firmas digitales** de recepción del pedido.
- **Estructura de Datos Extendida**: La tabla `products` utiliza `options` (JSONB) para metadatos de personalización, mientras que `orders` hace uso avanzado del tipo `JSONB` en la columna `incidents` para acoplar metadatos sin migraciones complejas, apoyada por las nuevas columnas `signature_url` y `delivered_at`.

### 4. Motor de Personalización (Storefront)
- **Lógica de Precios Pro**: El componente `ProductView` y `AddToCartButton` se han desacoplado para permitir precios calculados al vuelo (ej: Pollo +2€) sin depender exclusivamente del valor estático de la DB.
- **Flujo Legal**: El checkout valida el estado `acceptedTerms` antes de permitir el POST a Stripe, garantizando seguridad jurídica.

### 3. `src/app/admin/` (Rutas Clean)
Las páginas en el App Router serán solo "contenedores" delgados:
```tsx
// src/app/admin/customers/page.tsx
import { CustomersModule } from "@/modules/customers"

export default function Page() {
  return <CustomersModule />
}
```

## 🛠️ Plan de Acción (Sprint 2026)

1. **Fase 1: Cimientos**: Crear carpetas `src/modules` y `src/core`.
2. **Fase 2: Refactorización Piloto**: Migrar el módulo de `customers` (CRM).
3. **Fase 3: Refactorización Crítica**: Migrar `kitchen` (KDS) y `realtime-monitor`.
4. **Fase 4: Documentación Completa**: Actualizar `MASTER_README.md` y generar `TECHNICAL_AUDIT_2026.md`.

## 📈 Beneficios
- **Carga Diferida**: Mejor rendimiento al separar lógica pesada.
- **Depuración Rápida**: Si falla el KDS, solo miras `src/modules/kitchen`.
- **Trabajo en Paralelo**: Varios desarrolladores pueden tocar distintos módulos sin conflictos.
- **Micro-Componentes**: Obliga a que cada parte del UI sea pequeña y testeable.
