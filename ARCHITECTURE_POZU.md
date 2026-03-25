# Arquitectura Pozu 2.0: Core + Plugins

## 🚀 Filosofía de Diseño
Pozu 2.0 evoluciona hacia una estructura modular para garantizar escalabilidad, mantenibilidad y archivos de código cortos (menos de 200 líneas por componente). Cada sección del panel de administración es un "Plugin" independiente.

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

### 5. Configuración Centralizada, IA y Automatización (v3.0 Dynamic)
- **Interruptores Maestros (Master Switches)**: El panel de ajustes (`src/modules/settings`) permite el control granular en caliente de funcionalidades críticas (pagos online, efectivo, delivery, takeaway, modo mantenimiento) persistidas en la tabla `settings`.
- **IA Omnicanal Multimodal (n8n v3.0)**: El sistema cuenta con un orquestador n8n que procesa pedidos a través de **4 canales concurrentes** con capacidades de visión y audio:
  - 📞 **Vapi**: Agente de voz telefónico.
  - 💬 **Telegram**: Bot de mensajería interactivo con soporte para imágenes (análisis de platos) y audio (Whisper).
  - 📱 **WhatsApp**: A través de Evolution API.
  - 🌐 **Web Chat**: Widget integrado en el storefront con **persistencia en Postgres** (n8n_chat_histories).
- **Contexto Dinámico e Inteligencia de Riesgo**: La IA (GPT-4o/Llama-3.2) consume dinámicamente las configuraciones de `settings` y el perfil de riesgo del cliente mediante la función `get_customer_risk_profile`. Esto permite que el asistente tome decisiones de seguridad (ej: bloquear pagos en efectivo a clientes con muchas cancelaciones) en tiempo real.
- **Resiliencia de Build**: El cliente de Supabase incluye lógica de fallback para permitir compilaciones exitosas en Docker aunque las variables de entorno se inyecten post-build.
- **Validación Estricta**: Se ha implementado un motor de validación en el storefront y en la IA que obliga a la selección de opciones obligatorias (salsas para fritos, pollo crujiente para hamburguesas, gestión de alérgenos) antes de permitir la inserción del pedido (`orders`), asegurando que la data en Supabase esté 100% limpia para cocina.
- **Monitor de Salud**: Integración de trazas de errores directamente desde n8n hacia la tabla `error_logs`, expuesto en un dashboard dedicado en `/admin/error-logs` para visibilidad de los administradores.

### 3. `src/app/admin/` (Rutas Clean)
Las páginas en el App Router serán solo "contenedores" delgados:
```tsx
// src/app/admin/customers/page.tsx
import { CustomersModule } from "@/modules/customers"

export default function Page() {
  return <CustomersModule />
}
```

## 🐳 6. Estrategia de Despliegue (Docker & VPS)
Pozu 2.0 ha sido optimizado para despliegues profesionales en servidores VPS (ej: Hostinger KVM) utilizando **Dokploy**.

### Optimización Standalone
- Se ha configurado `output: 'standalone'` en `next.config.ts`. Esto permite que Next.js genere un servidor Node.js mínimo que contiene solo los archivos necesarios para producción, reduciendo el tamaño de la imagen Docker de GBs a MBs.

### Pipeline de Docker (Dockerfile Multietapa)
1. **Etapa `deps`**: Instalación limpia de dependencias de producción.
2. **Etapa `builder`**:
   - Ejecución de `scripts/build-frames-manifest.mjs` para pre-generar los catálogos multimedia.
   - Compilación nativa de Next.js con soporte para variables de entorno de construcción.
3. **Etapa `runner`**: Imagen final basada en Alpine Linux para máxima seguridad y ligereza, exponiendo el puerto 3000.

### Integración con Dokploy
- **Create Environment File**: Dokploy genera automáticamente el archivo `.env` necesario para que la IA y las pasarelas de pago funcionen sin configurar argumentos manuales en el Dockerfile.
- **Reverse Proxy**: Traefik gestiona la terminación SSL y el enrutamiento hacia el contenedor de Pozu.

---

## 🛠️ Plan de Acción (Sprint 2026)

1. **Fase 1: Cimientos**: Crear carpetas `src/modules` y `src/core`.
2. **Fase 2: Refactorización Piloto**: Migrar el módulo de `customers` (CRM).
3. **Fase 3: Refactorización Crítica**: Migrar `kitchen` (KDS) y `realtime-monitor`.
4. **Fase 4: Dockerización y VPS**: Implementación de Dockerfile multietapa y despliegue en Dokploy (Completado ✅).
5. **Fase 5: Documentación Completa**: Sincronización de `README.md`, `ARCHITECTURE_POZU.md` y `TECHNICAL_AUDIT_2026.md` con las nuevas capacidades v3.0.

## 📈 Beneficios
- **Carga Diferida**: Mejor rendimiento al separar lógica pesada.
- **Depuración Rápida**: Si falla el KDS, solo miras `src/modules/kitchen`.
- **Trabajo en Paralelo**: Varios desarrolladores pueden tocar distintos módulos sin conflictos.
- **Micro-Componentes**: Obliga a que cada parte del UI sea pequeña y testeable.
- **Control en Tiempo Real**: Capacidad de apagar/encender el negocio digitalmente sin desplegar código.
- **Independencia de Platform-as-a-Service**: Al usar Docker, Pozu ya no depende de Vercel y puede correr en cualquier VPS con costes fijos.
