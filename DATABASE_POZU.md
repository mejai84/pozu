# Documentación de Base de Datos - Pozu 2.0 (v3.0)

## 🗄️ Resumen del Esquema
La base de datos utiliza **Supabase (PostgreSQL)** con políticas de seguridad **RLS** para proteger la integridad de los datos.

## 📊 Tablas Principales

### `orders` (Pedidos)
Almacena todos los pedidos omnicanal (Web, WhatsApp, Telegram, Vapi).
- `id` (UUID, PK)
- `guest_info` (JSONB): Información del cliente (`full_name`, `phone`).
- `delivery_address` (JSONB): Datos de entrega (`street`, `city`).
- `subtotal` (NUMERIC): ⭐ **NUEVO** Precio base sin impuestos ni envío.
- `tax_amount` (NUMERIC): ⭐ **NUEVO** Impuesto calculado (IVA).
- `delivery_fee` (NUMERIC): ⭐ **NUEVO** Costo de envío dinámico.
- `total` (NUMERIC): Total final a pagar.
- `status` (TEXT): `pending`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `cancelled`.
- `payment_method` (TEXT): `cash`, `card`, `pending`.
- `incidents` (JSONB): Historial de problemas en la entrega.
- `signature_url` (TEXT): URL de la firma digital.

### `error_logs` (Logs de IA/Automation) ⭐ **NUEVA**
Captura errores de ejecución del flujo n8n para auditoría técnica.
- `id` (UUID, PK)
- `node_name` (TEXT): Nombre del nodo que falló.
- `error_message` (TEXT): Descripción del error.
- `workflow_id` (TEXT)
- `item_data` (JSONB)
- `created_at` (TIMESTAMPTZ)

### `settings` (Configuración Dinámica)
Configuración centralizada que n8n consume al vuelo.
- `key`: `feature_flags`, `delivery_settings`.
- `value` (JSONB): Contiene `% IVA`, `Costo Envío`, `Master Switches`.

---

## 🛠️ Funciones y RPCs Avanzados

### `get_customer_risk_profile(p_phone TEXT)`
Analiza el historial del cliente para seguridad en ventas.
- **Lógica**: 
  - **VERDE**: 0 incidencias.
  - **AMARILLO**: 1 incidencia.
  - **ROJO**: 2+ incidencias.
- **Uso**: Llamada desde la IA para decidir si permite pago en efectivo.

---

## 🔐 Seguridad (RLS)
- **Roles**: `admin`, `manager`, `kitchen`, `cashier`, `delivery`, `waiter`, `customer`.
- **Acceso**: Los logs de error y ajustes de settings solo son editables por el rol `admin`.
