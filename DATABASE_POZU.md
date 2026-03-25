# Documentación de Base de Datos - Pozu 2.0 (v3.0 Dynamic)

## 🗄️ Resumen del Esquema
La base de datos utiliza **Supabase (PostgreSQL)** con políticas de seguridad **RLS** para proteger la integridad de los datos.

## 📊 Tablas Principales

### `orders` (Pedidos)
Almacena todos los pedidos omnicanal (Web, WhatsApp, Telegram, Vapi).
- `id` (UUID, PK)
- `guest_info` (JSONB): Información del cliente (`full_name`, `phone`).
- `delivery_address` (JSONB): Datos de entrega (`street`, `city`).
- `subtotal` (NUMERIC): Precio base sin impuestos ni envío.
- `tax_amount` (NUMERIC): Impuesto calculado (IVA).
- `delivery_fee` (NUMERIC): Costo de envío dinámico.
- `total` (NUMERIC): Total final a pagar.
- `status` (TEXT): `pending`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`.
- `payment_method` (TEXT): `cash`, `card`, `pending`.
- `payment_status` (TEXT): ⭐ **NUEVO** `pending` → `paid`. Actualizado por Stripe Webhook en Next.js.
- `payment_link` (TEXT): ⭐ **NUEVO** Link de pago generado por Stripe vía n8n (para pedidos con tarjeta).
- `source` (TEXT): ⭐ **NUEVO** Canal de origen: `telegram`, `whatsapp`, `vapi`, `website_chat`, `web`.
- `incidents` (JSONB): Historial de problemas en la entrega.
- `signature_url` (TEXT): URL de la firma digital de entrega.
- `delivered_at` (TIMESTAMPTZ): Timestamp de entrega confirmada.

### `products` (Catálogo)
- `id` (UUID, PK)
- `name` (TEXT): Nombre del producto.
- `price` (NUMERIC): Precio base.
- `description` (TEXT): Descripción gastronómica.
- `ingredients` (TEXT[]): Lista de ingredientes.
- `allergens` (TEXT): ⭐ **NUEVO** Texto de alérgenos (Gluten, lácteos, etc.). Usado por la IA para responder consultas de clientes.
- `options` (JSONB): Extras (pollo crujiente, salsas, etc.).
- `stock_quantity` (INT): Stock disponible. Si llega a 0, la IA no lo vende.
- `is_available` (BOOL): Disponibilidad en carta.
- `category_id` (UUID, FK): Referencia a la categoría.

### `error_logs` (Logs de IA/Automation)
Captura errores de ejecución del flujo n8n para auditoría técnica. Visible en `/admin/error-logs`.
- `id` (UUID, PK)
- `node_name` (TEXT): Nombre del nodo que falló.
- `error_message` (TEXT): Descripción del error.
- `alert_message` (TEXT): ⭐ **NUEVO** Mensaje formateado de alerta enviado al Telegram del admin.
- `canal` (TEXT): ⭐ **NUEVO** Canal de origen del error (`whatsapp`, `telegram`, `vapi`, `website_chat`).
- `workflow_id` (TEXT): ID del workflow n8n.
- `item_data` (JSONB): Datos del item que causó el error.
- `created_at` (TIMESTAMPTZ): Timestamp del fallo.

### `chat_messages` (Chat Histórico)
Almacena el historial de conversación del widget web para sincronización con la IA.
- `id` (UUID, PK)
- `session_id` (TEXT): ID único de sesión del navegador (`web_xxxxxx`).
- `sender` (TEXT): `user` o `assistant`.
- `message` (TEXT): Contenido del mensaje.
- `attachment_url` (TEXT): URL opcional de imagen o archivo adjunto.
- `timestamp` (TIMESTAMPTZ): Fecha y hora del mensaje.

### `n8n_chat_histories` (Memoria Persistente IA)
Tabla optimizada para que n8n recupere el contexto exacto de la conversación entre reinicios del servidor.
- `id` (SERIAL, PK)
- `session_id` (TEXT): Relacionado con el chat web o identificador de red social.
- `message` (JSONB): Estructura completa del mensaje compatible con LangChain.
- `created_at` (TIMESTAMPTZ): Timestamp de creación.

### `settings` (Configuración Dinámica)
Configuración centralizada que n8n consume al vuelo.

| key | Campos JSONB relevantes |
|-----|-------------------------|
| `feature_flags` | `online_payments_enabled`, `cash_payments_enabled`, `maintenance_mode`, `delivery_enabled`, `takeaway_enabled`, `reservations_enabled`, `tracking_enabled` |
| `delivery_settings` | `delivery_fee`, `min_order_amount`, `taxes_enabled`, `tax_percentage` |
| `business_info` | `business_name`, `phone`, `email`, `address`, `is_open` |
| `business_hours` | Horarios por día de la semana |
| `printers_config` | Array de impresoras vinculadas |

---

## 🛠️ Funciones y RPCs Avanzados

### `get_customer_risk_profile(p_phone TEXT)`
Analiza el historial del cliente para seguridad en ventas.
- **Lógica**: 
  - **VERDE**: 0 incidencias.
  - **AMARILLO**: 1 incidencia.
  - **ROJO**: 2+ incidencias.
- **Uso**: Llamada desde n8n antes de confirmar un pedido.

---

## 🔐 Seguridad (RLS)
- **Roles**: `admin`, `manager`, `kitchen`, `cashier`, `delivery`, `waiter`, `customer`.
- **Acceso**: Los logs de error y ajustes de settings solo son editables por el rol `admin`.

---
*Última actualización: 25 Marzo 2026 (v3.1)*
*Nota: Esquema v3.1 optimizado para flujos deterministas en n8n y persistencia de sesión persistente en chat omnicanal.*
