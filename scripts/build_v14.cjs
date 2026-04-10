const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\Cesar\\Downloads\\Pozu_FIXED_v13.json';
const destPath = path.join(__dirname, '..', 'Pozu_MASTER_v14_FINAL.json');

try {
  console.log('Leyendo origen:', srcPath);
  const rawData = fs.readFileSync(srcPath, 'utf8');
  const workflow = JSON.parse(rawData);

  // 1. Modificar nodo "Preparar para Supabase"
  const prepNode = workflow.nodes.find(n => n.name === 'Preparar para Supabase');
  if (prepNode && prepNode.parameters && prepNode.parameters.assignments && prepNode.parameters.assignments.assignments) {
    const assignments = prepNode.parameters.assignments.assignments;
    
    // Add or update address
    const addressAss = assignments.find(a => a.name === 'address');
    const addressValue = "={{ (() => { const out = $('Extraer Datos Estructurados').first().json.output; const parsed = (typeof out === 'string') ? (() => { try { return JSON.parse(out.match(/\\{[\\s\\S]*\\}/)?.[0] || '{}'); } catch(e) { return {}; } })() : (out || {}); return (parsed?.Direccion || parsed?.direccion || '').trim().replace(/[\\n\\r]/g, ''); })() }}";
    if (addressAss) {
      addressAss.value = addressValue;
    } else {
      assignments.push({
        id: "addr-crm-fix",
        name: "address",
        value: addressValue,
        type: "string"
      });
    }

    // Add or update customer_name
    const nameAss = assignments.find(a => a.name === 'customer_name');
    const nameValue = "={{ (() => { const out = $('Extraer Datos Estructurados').first().json.output; const parsed = (typeof out === 'string') ? (() => { try { return JSON.parse(out.match(/\\{[\\s\\S]*\\}/)?.[0] || '{}'); } catch(e) { return {}; } })() : (out || {}); return (parsed?.Nombre || parsed?.nombre || 'Cliente').trim().replace(/[\\n\\r]/g, ''); })() }}";
    if (nameAss) {
      nameAss.value = nameValue;
    } else {
       assignments.push({
        id: "name-crm-fix",
        name: "customer_name",
        value: nameValue,
        type: "string"
      });
    }

    // Update payment_link to safely check execution
    const paymentLinkAss = assignments.find(a => a.name === 'payment_link');
    if (paymentLinkAss) {
      paymentLinkAss.value = "={{ $('Generar Link Pago').isExecuted ? ($('Generar Link Pago').item.json.url || \"\") : \"\" }}";
    }
  } else {
    console.warn('⚠️ No se encontró el nodo "Preparar para Supabase" o sus asignaciones.');
  }

  // 2. Filtrar Evento Stripe asegurando que sea checkout.session.completed
  const stripeEventFilter = workflow.nodes.find(n => n.name === 'Filtrar Evento Stripe');
  if (stripeEventFilter && stripeEventFilter.parameters && stripeEventFilter.parameters.conditions) {
     stripeEventFilter.parameters.conditions.conditions = [
        {
          id: "sev-1",
          leftValue: "={{ $json.type }}",
          rightValue: "checkout.session.completed",
          operator: {
            type: "string",
            operation: "equals"
          }
        }
     ];
  } else {
      console.warn('⚠️ No se encontró el nodo "Filtrar Evento Stripe".');
  }

  workflow.name = "Pozu_MASTER_v14_FINAL";

  fs.writeFileSync(destPath, JSON.stringify(workflow, null, 2));
  console.log("✅ Exito! Guardado en:", destPath);
} catch (e) {
  console.error("❌ Error:", e);
  process.exit(1);
}
