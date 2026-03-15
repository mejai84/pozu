# 📖 Manual en Vivo: Desarrollo en Pozu 2.0

## 🛠️ Cómo crear un nuevo módulo (Plugin)

Si necesitas añadir una nueva sección al panel de administración (ej: "Inventario"), sigue estos pasos:

### 1. Crear la estructura en `src/modules`
```bash
mkdir -p src/modules/inventory/components
mkdir -p src/modules/inventory/hooks
touch src/modules/inventory/index.tsx
touch src/modules/inventory/types.ts
```

### 2. Definir los tipos
En `types.ts`, define las interfaces de tus datos para tener autocompletado y seguridad.

### 3. Crear el Hook de datos
En `hooks/useInventory.ts`, coloca toda la lógica de Supabase (SELECT, INSERT, UPDATE).
```typescript
export const useInventory = () => {
  // lógica aquí...
  return { items, loading, addItem };
}
```

### 4. Orquestar en `index.tsx`
Este archivo solo debe llamar al hook y renderizar los componentes pequeños de la carpeta `components/`. **Regla de oro: No más de 200 líneas.**

### 5. Registrar la ruta
Crea `src/app/admin/inventory/page.tsx`:
```tsx
import { InventoryModule } from "@/modules/inventory"
export default Page = () => <InventoryModule />
```

## 🎨 Estándares de Diseño (Premium UI)

- **Colores**: Usa la paleta Pozu (Negro #0A0A0A, Primario #FFD700 u otro color vibrante definido).
- **Sombras**: Usa `shadow-2xl` y bordes `border-white/10`.
- **Feedback**: Todo botón debe tener un estado de `loading` (Loader2 de Lucide).
- **Animaciones**: Usa `<motion.div>` de Framer Motion para entradas suaves.

## 🛡️ Sistema Anti-Fraude (Escudo Pozu)
Al trabajar con pedidos, siempre consulta la función RPC `check_order_risk(phone)`.
- **Rojo**: Solo pago con tarjeta.
- **Amarillo**: Pedido pendiente de confirmar.
- **Verde**: Cliente VIP, marchar directo.
