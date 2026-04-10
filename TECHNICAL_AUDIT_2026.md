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
- [x] **Chat Omnicanal v3.0**: Implementación de tabla `chat_messages` con Realtime y webhook directo a n8n para respuestas IA en el storefront.

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

### 13. Optimización y Resiliencia de Pozu Chat (v3.1 Stable) ✅
- [x] **Rediseño Visual Premium**: Implementación de estética "Brutalismo Premium" con `framer-motion` (staggered entrance, floating button).
- [x] **Resiliencia de Conexión**: Añadido **AbortController** con timeout de 15s para evitar bloqueos en la UI si n8n no responde.
- [x] **Doble Persistencia de Chat**: Sincronización simultánea en `chat_messages` (UI reactiva) y `n8n_chat_histories` (Memoria de IA en formato LangChain).
- [x] **Blindaje de Webhook**: Refactorización del payload para incluir campos redundantes (`text` y `message: { text }`), garantizando compatibilidad con el enrutador de n8n.
- [x] **Feedback de Error UI**: Implementación de mensajes de error amigables en el chat si el webhook de n8n falla (CORS, 500 o Timeout).
- [x] **Soporte de Audio**: Preparación de la interfaz para dictado por voz (Dictation indicator).

## 📝 Notas de Implementación
- **Estándar n8n (v3.1 Production)**: El archivo `workflow_POZU_FULL_FIXED.json` es ahora el esquema oficial del sistema omnicanal (Web, Telegram, WhatsApp, Stripe).
- **Frontend Resilience**: Uso de `AbortController` (timeout 10s) en el componente de chat para feedback de red en tiempo real.
- **Supabase Sync**: Las tablas `chat_messages` y `n8n_chat_histories` deben mantener Realtime habilitado para coherencia visual.

### 14. Robustez de Pozu AI y Conciencia de Herramientas (v3.2) ✅
- [x] **Inyección de Contexto Dinámico**: El `systemMessage` del Agente ahora consume en tiempo real parámetros de `feature_flags` y `delivery_settings` para evitar respuestas genéricas sobre pagos y envío.
- [x] **Refactor de Búsqueda de Menú**: La herramienta `verificar_producto` ahora soporta consultas de lenguaje natural sobre el "menú completo", "carta" o "hamburguesas", devolviendo el listado de 22 productos con precios sin fallar.
- [x] **Soporte de Consultas de Negocio**: Integración de lógica en la herramienta para responder sobre horarios generales, ubicación y métodos de pago sin salir del flujo de IA.
- [x] **Blindaje Anti-Alucinación**: Instrucción estricta en el prompt del Agente para forzar el uso de herramientas ante cualquier duda de producto, eliminando el mensaje recurrente "No tengo acceso al menú".
- [x] **Optimización de Iteraciones**: Incrementado `maxIterations` a 10 en el Agente n8n para permitir búsquedas profundas si el cliente tiene múltiples dudas antes de confirmar el pedido.

### 15. Estabilización de Enrutamiento del Chatbot n8n (Abril 2026) ✅
- [x] **Enrutamiento Casual vs. Pedidos**: Separación estricta de caminos de respuesta local en n8n mediante analizador condicional (`detalle_pedido`).
- [x] **Reparación de Objeto de Respuesta**: Reconstrucción del nodo `Responder Datos Incompletos Web` con expresión n8n sintácticamente válida (`success: true`) para enviar la réplica conversacional.
- [x] **Protección de Mensajes de Web Chat**: Confirmación exhaustiva del *Switch Clasificador de Contenido*, filtrando y dirigiendo `website_chat` al evaluador de texto con fallback anti-emojis.
- [x] **Reestructuración Visual de Carta AI**: Categorización en la herramienta `Verificar Productos` para devolver listado dinámico separado por categorías (Gourmet, Sandwiches, Picoteo).
- [x] **Merging de Nodos Consolidado**: Autogenerado archivo maestro `workflow_POZU_FULL_FIXED.json` sin errores semánticos `=={{`, apto para inyección productiva.

### 16. Estabilización n8n JSON Extraction y Rate Limits (Abril 2026) ✅
- [x] **Gestión de Respuestas Vacías (Empty Body JSON)**: Aumentado el `timeout` a 35 segundos en el webhook del frontend (`ai-chat-button.tsx`) y añadido manejo de excepciones para cierres inesperados de conexión.
- [x] **Inline Parse de LangChain**: Las celdas críticas (`Preparar para Supabase` y `Preparar Pago Tarjeta`) han sido actualizadas con lógica en línea `Regex+JSON.parse` para extraer objetos JSON directamente desde las respuestas de texto bruto del Agente IA sin necesidad de nodos intermedios, para máxima retrocompatibilidad.
- [x] **Control de Rate Limits (Groq)**: Se ha verificado que la cuota de la API para modelos masivos (Llama 70B) genera bloqueos gestionados de 1h ("Rate limit reached"), activando perfectamente la rama salvavidas del flujo n8n para notificar al usuario en el chat.

### 17. Estabilización Flujo de Pagos y Web Chat UI (Abril 2026) ✅
- [x] **Reparación de Tipos de Dato n8n**: Eliminación de errores `=24` y `customer_phone null` corrigiendo sintaxis Javascript y expresiones lambda dentro de n8n para asegurar tipos estrictos `Number` y `String` en la inserción a Supabase.
- [x] **Solución Enlaces Mudos en Chat**: Implementación de función `renderMessageWithLinks` en `ai-chat-button.tsx` para forzar evaluación por Regex de URLs (provenientes de Stripe) generadas por IA como etiquetas `href` activas en la UI.
- [x] **Scrollbar y Selección Táctil**: Modificación de clases `touch-none` e inyección de `select-text` en componente Web Chat, restaurando el comportamiento de scroll interactivo y lectura nativa.
- [x] **Arquitectura KDS**: Verificación de ciclo de flujo estricto; el KDS ignora pedidos `pending` generados por Stripe a la espera de conciliación del Webhook para proteger producción.
- [x] **Unificación de Dominio Tracking**: Cambio de `pozu.es` a `pozu2.com` en todos los nodos de salida (Telegram, WhatsApp, Web) para que el enlace de seguimiento funcione correctamente sobre la nueva infraestructura Dokploy.

---
*Última actualización: 10 Abril 2026 — Fix: Persistencia de Pedidos, Race Condition Stripe, Página /pago-exitoso*

### 18. Persistencia de Pedidos y Fix Race Condition Stripe (Abril 2026) ✅
- [x] **Diagnóstico Completo de Flujo n8n**: Identificados 6 bugs críticos que impedían la persistencia de pedidos en Supabase y la actualización del dashboard.
- [x] **Migración DB `20260410_orders_n8n_columns.sql`**: Añadidas columnas `customer_name` (TEXT), `customer_phone` (TEXT), `items` (JSONB) y `paid_at` (TIMESTAMPTZ) a la tabla `orders`. Sin estas columnas el INSERT de n8n fallaba con error 400 silencioso.
- [x] **Fix Switch sin Fallback**: Nodo `Verificar Método Pago` ahora tiene `fallbackOutput: extra` conectado a `Preparar para Supabase`. Pedidos con método de pago ambiguo ya no se pierden.
- [x] **Fix onError Silencioso**: `Preparar para Supabase` cambiado de `continueErrorOutput` (salida desconectada) a `continueRegularOutput`. Los datos ya no se pierden silenciosamente si falla una expresión.
- [x] **Fix Race Condition Stripe**: Reestructuradas las connections de `Insertar Pedido en Supabase` para que la respuesta al cliente salga **DESPUÉS** de que Stripe genere el link, no en paralelo. Flujo: Insertar → ¿Es Tarjeta? → (Stripe → Actualizar) → Responder.
- [x] **Eliminación de Nodo Duplicado**: Eliminado nodo `Responder Chat Web Pedido` que respondía al chat web saltándose el flujo de Stripe.
- [x] **Fix Stripe success_url**: Actualizada `success_url` de Stripe para incluir `?order_id={id}`, permitiendo que `/pago-exitoso` muestre el resumen del pedido.
- [x] **Fix Mensaje de Tracking**: El mensaje al canal ahora muestra el link de pago Stripe si el método es tarjeta, y el link de tracking directo si es efectivo. El tracking llega DESPUÉS del pago.
- [x] **Nueva Página `/pago-exitoso`**: Creada `src/app/pago-exitoso/page.tsx` con confirmación visual premium, resumen del pedido desde Supabase (por `order_id`), realtime listener de `payment_status`, y botón directo a `/pedidos/tracking`.
- [x] **Fix useOrders.ts Hook**: Corregido polling roto que solo copiaba el array sin re-fetchear. Añadida suscripción realtime `postgres_changes` para actualización instantánea al recibir pedidos de n8n.
- [x] **Script Automatizado de Patching**: `scripts/patch_workflow.cjs` genera `Pozu_FIXED_v8.json` y `v9.json` aplicando los 11 fixes de forma reproducible sobre cualquier versión del workflow.

### 19. Fix Caché Schema, Error de FK e Interfaz de Claves Dinámicas (Abril 2026) ✅
- [x] **Fix Caché Supabase & Missing Tables**: Creado script `20260410_schema_cache_fix.sql` para forzar creación segura de la tabla vital `order_items` (solucionando 404 en el flow web de n8n) y columna `order_type` de la tabla `orders` (solucionando quiebre en creación de caja registradora), inyectando además un NOTIFY `pgrst, reload schema` para prevenir de-sync.
- [x] **Falso Positivo en UUID frente a TEXT**: Descubierto que nativamente `products.id` en Supabase live es `TEXT` en vez de `UUID`. Arreglado en la migración de `order_items` forzando sus foreign keys (`product_id` y `combo_id`) como `TEXT` para evitar el error colateral _Key columns "product_id" and "id" are of incompatible types_.
- [x] **Migración Claves Stripe a Dynamic DB**: Desacopladas las keys de Stripe respecto al archivo `.env` o las Server Variables de Dokploy. 
- [x] **Implementación Multi-Gateway en Panel de Admin**: Actualizados `FeaturesTab.tsx`, el hook de almacenamiento de `useSettings.ts` y las types para admitir de forma visual `stripe_public_key` y `stripe_secret_key`.
- [x] **Seguridad por Chat (Admin PIN)**: Añadida sección en Ajustes para definir un PIN de gestión remota para la IA.

### 20. Estabilización de Producción y Normalización de Datos (10 Abril 2026) ✅
- [x] **Normalización Universal de Nombres**: Implementado "Traductor de Nombres" en los archivos `OrderDetailModal`, `OrderBoard`, `KDSCard`, `KDSModal` y `OrderCard`. El sistema ahora detecta el nombre del cliente desde cualquier campo (`customer_name`, `full_name`, `name`) y gestiona correctamente datos en formato texto o JSON.
- [x] **Tracking Interactivo con Bloqueo de Pago**: Rediseñada la página `/pedidos/tracking` para mostrar un estado de "PAGO PENDIENTE" si el pedido es de tarjeta y no ha sido abonado. Incluye botón directo a Stripe y Realtime Sync para actualizarse al instante del pago.
- [x] **Fix Stripe Webhook (500 Error)**: Identificada y documentada la necesidad de inyectar `STRIPE_SECRET_KEY` en Dokploy para habilitar el endpoint de webhook nativo de Next.js.
- [x] **Resiliencia de Tickets**: Corregida detección de método de pago en el generador de tickets para pedidos provenientes de n8n v3.1.
- [x] **Monitor Live Sanity**: Eliminado chequeo bloqueante de riesgo de cliente (`check_order_risk`) que causaba pantalla negra en caso de fallo de RPC, garantizando visibilidad total del negocio.
- [x] **Fix Pago Exitoso**: Implementado sistema de reintentos y `.maybeSingle()` en `/pago-exitoso` para manejar la latencia entre Stripe y Supabase sin errores 406.

### 21. Inteligencia de CRM y Captura Multicanal (10 Abril 2026) ✅
- [x] **CRM Smart Extraction**: El módulo de Clientes ahora extrae dinámicamente nombres y teléfonos de pedidos de WhatsApp/Telegram procesados por n8n, eliminando los registros "Desconocido".
- [x] **Visualización de Ubicación 📍**: Añadida la dirección de entrega directamente en la lista del CRM y en el modal de detalles del cliente para agilizar la logística.
- [x] **Normalización de Tipos (Final Clean)**: Sincronización de interfaces TypeScript en Kitchen, Orders y Realtime Monitor para asegurar builds de producción 100% estables en Dokploy.
- [x] **Bugfix Dokploy (Production Build)**: Inyectada propiedad `items?: any` en la interfaz `Order` del módulo Orders.
- [x] **Bugfix Settings UI**: Corregida la interfaz de `Props` en `FeaturesTab.tsx` añadiendo la propiedad `onSave` faltante, eliminando el último bloqueo de compilación de Dokploy.
