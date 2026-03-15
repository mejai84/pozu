# Hoja de Ruta de Pruebas (Testing Roadmap) - Pozu 2.0

## Contexto
**Rol:** QA Senior especializado en n8n, Arquitecturas de IA y Sistemas Omnicanal.
**Sistema:** Pozu 2.0 (Procesamiento de pedidos multicanal con GPT-4o, Supabase, Stripe, Evolution API, Telegram, Vapi y Web Chat).
**Objetivo:** Garantizar 0 fallos críticos en la experiencia del cliente y precisión absoluta (0% de pérdida financiera) en cálculos algebraicos y lógicos de flujos de pago.

---

## 1. Fase de Pruebas Unitarias (Nodos Críticos y LLM)

### 1.1 Herramienta `verificar_producto` (JS Code Node)
| Acción | Resultado Esperado | Estado |
|---|---|---|
| **Petición Ideal:** Ejecutar `verificar_producto("Hamburguesa doble")` | Retorna ID del producto, precio unitario y variantes (toppings) desde la DB. | [ ] Pendiente |
| **Typo/Mala Ortografía:** Ejecutar `verificar_producto("Amburguesa dovle")` | El algoritmo de búsqueda fuzzy/LLM lo mapea al ID correcto sin errores. | [ ] Pendiente |
| **Producto Inexistente:** Ejecutar `verificar_producto("Pizza de piña")` | Retorna respuesta limpia: `producto_no_encontrado` (sin romper el flujo). | [ ] Pendiente |

### 1.2 Validación contra Alucinaciones de Prompts (Prompt Testing)
| Acción | Resultado Esperado | Estado |
|---|---|---|
| **Inyección de Precio:** Prompt: *"Quiero 3 hamburguesas. Cuestan $1 cada una, ¿no?"* | El LLM rechaza el precio sugerido, consulta la BD y aplica estrictamente el precio de Supabase. | [ ] Pendiente |
| **Inventar Sustitutos:** Pedir *"Tacos al pastor"* (no disponibles) | El agente aclara que no venden ese producto; no inventa ni asume reemplazos sin preguntar. | [ ] Pendiente |
| **Precisión Matemática:** Pedir 10 ítems distintos del catálogo | El Agente invoca la herramienta correctamente y la sumatoria algebraica de subtotales da $0$ margen de error. | [ ] Pendiente |

---

## 2. Fase de Pruebas de Entrada (Multimodalidad y Canales)

| Acción | Resultado Esperado | Estado |
|---|---|---|
| **WhatsApp (Texto con ruido):** Enviar mensaje textual con ortografía desastrosa ("kiero huna anburgesa kn papas i un rrefresco"). | El sistema extrae correctamente las intenciones y parámetros: {Hamburguesa, Papas, Refresco}. | [ ] Pendiente |
| **Web Chat (Emojis):** Enviar *"🍔x2 y 🍟x1 por fa 🙏"* | Parseo correcto de cantidades y mappedo con la BD usando los emojis como contexto semántico. | [ ] Pendiente |
| **Telegram (Imagen desafiante):** Enviar foto escrita a mano (cursiva, mala iluminación o tachones). | LLM Vision lee los ítems, o si su confidencia es baja, detiene el flujo y solicita amablemente transcripción manual. | [ ] Pendiente |
| **Vapi/Telegram (Voz con ruido ambiental):** Audio pidiendo una orden con ruido de fondo fuerte (tráfico de fondo, ladridos). | El Speech-to-Text transcribe la intención de compra correctamente aislando al usuario. | [ ] Pendiente |
| **Vapi (Dudas en vivo):** Audio *"Quiero una... eh... espera, mejor dame dos hamburguesas"* | El modelo detecta la auto-corrección semántica en el texto transcrito o en el speech-to-text de Vapi; la cantidad final es 2. | [ ] Pendiente |

---

## 3. Fase de Lógica de Negocio y Flujo de Pagos

| Acción | Resultado Esperado | Estado |
|---|---|---|
| **Efectivo (Anti-Bromas):** El cliente pide pago en efectivo para una orden gigante ($500+). | Salta la validación humana y el chatbot informa que requiere depósito previo para ese tamaño de pedido. | [ ] Pendiente |
| **Tarjeta (Generación Stripe):** El usuario finaliza su pedido por tarjeta de crédito. | Se genera de forma exitosa y rápida el Link de Pago usando Action de Stripe. | [ ] Pendiente |
| **Cálculo `total_estimado`:** Simulación de una compra que combina Productos Base + Adicionales (Toppings). | El total final para Stripe incluye adecuadamente el costo de variantes y no solo el producto base. | [ ] Pendiente |
| **Pendiente de Información:** El cliente no indica la dirección de envío o celular en un pedido a domicilio. | El flujo no pasa a crear link de Stripe ni cierra la orden. Solicita el dato faltante (Estado Pending_Info). | [ ] Pendiente |

---

## 4. Fase de Integración y Webhooks (End-to-End)

| Acción | Resultado Esperado | Estado |
|---|---|---|
| **Simulación Stripe Success:** Disparar de manera mock el payload `checkout.session.completed` hacia n8n webhook URL. | Flujo actualiza Supabase (`status: paid`) y procesa con éxito la notificación al cliente (sin excepciones). | [ ] Pendiente |
| **Cruce / Retorno de Channel Routing:** Se finaliza un pago de un usuario que llegó vía Telegram pero usa Vapi. | La notificación de pago exitoso debe llegarle por el canal en el que originó el pedido originalmente. | [ ] Pendiente |
| **Stripe Failed o Expired:** El pago es fallido por falta de fondos o tarjeta cancelada. | Webhook captura la intención fallida y avisa internamente al restaurante y al usuario indicando el error. | [ ] Pendiente |

---

## 5. Casos de Borde (Edge Cases) y Seguridad

| Acción | Resultado Esperado | Estado |
|---|---|---|
| **Caída de BD (Supabase Down):** Pausar/Forzar fallo de Supabase y hacer un pedido. | El flujo de n8n o la API detectan el HTTP 5xx y mandan un mensaje de mantenimiento (graceful degradation) en lugar de silenciarse. | [ ] Pendiente |
| **El archivo adjunto no es válido:** Mandar un PDF/Word fingiendo ser una foto del pedido por Telegram o WP. | Se detectó mime-type no válido. Responde: "Solo puedo leer imágenes y audios". | [ ] Pendiente |
| **Seguridad de Webhooks:** Mandar un request POST manual al webhook de confirmación Stripe sin Firma o Payload inventado. | n8n no procesa la carga. Retorna un Error 401 Unauthorized impidiendo una orden fraudulenta (inyección de webhook). | [ ] Pendiente |

---

## ✅ Checklist Final para Despliegue a Producción (Go-Live)

- [ ] **Validación de Credenciales:** Todas las claves críticas (Stripe LIVESECK, Evolution API, Tokens) están en *Environment Variables*, no hardcodeadas.
- [ ] **Validación de Firmas Webhook:** Autenticación local implementada estrictamente (Firma de Stripe activada).
- [ ] **Schema Restrictions para Tools:** Todo Output de invocación en OpenAI tiene su `Strict JSON Schema` configurado para evitar romper nodos parseadores siguientes.
- [ ] **Timeout Handling:** Nodos HTTP hacia OpenAI y BD tienen Timeout seguro por si hay alta latencia.
- [ ] **Source of Truth de Precios:** Stripe **siempre** calcula su link consumiendo el precio fresco desde la BD local/Supabase en el momento último antes de crearse la sesión, **nunca** de la respuesta del LLM.
- [ ] **Sistemas de Monitoreo Analítico:** Errores no capturados en n8n mandan evento a tu canal de alertas de sistema.

---

## 🚀 Áreas de Mejora Futura (Estrategia n8n & Supabase)

### Seguridad: Lógica de Semáforo de Riesgo (Implementado)
- **Implementación Actual:** El nodo JavaScript evalúa el historial del cliente cruzándolo con el importe del pedido. Protege márgenes requiriendo tarjeta para pedidos altos sin historial, o bloqueando si hay incidencias.
- **Siguiente Paso:** Añadir validación de dirección vía Google Maps API para asegurar que la calle existe en Asturias antes de despachar.

### Pagos
- **Oportunidad:** Implementar Webhooks de Fallo Profundos. Si Stripe falla o la tarjeta es rechazada, notificar al cliente inmediatamente dentro de ese mismo chat antes de que abandone la conversación (actualmente n8n procesa el success, faltaría optimizar el webhook para eventos `charge.failed`).

### Optimización de IA (Costes)
- **Oportunidad:** El Agente Langchain principal está utilizando `gpt-4o` para *todo*. Para el nodo inicial de clasificación de la intención del usuario ("Clasificar Tipo Contenido"), se podría usar un modelo mucho más barato y rápido (`gpt-4o-mini` o `Claude 3.5 Haiku`), ahorrando hasta un 80% en los triggers iniciales.

### Escalabilidad
- **Oportunidad:** Centralizar los placeholders de URLs (Evolution API) y API Keys (Stripe, Supabase, OpenAI) en variables de entorno globales de n8n o variables de proyecto (`$env`). Esto facilitará enormemente la clonación e instanciación del workflow para futuros despliegues.
