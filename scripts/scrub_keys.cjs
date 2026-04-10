const fs = require('fs');
const files = ['Pozu_MASTER_v14_FINAL.json', 'Pozu_MASTER_v14_FINAL_POZU.json', 'Pozu_FIXED_v13.json', 'node_final.json', 'test_webhook.json', 'n8n_fixes_pedidos.json', 'node_export_v3.json'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    try {
        const text = fs.readFileSync(f, 'utf8');
        // Simple regex replace for gsk_ keys (Groq) or other obvious tokens
        const scrubbed = text.replace(/gsk_[a-zA-Z0-9]{20,}/g, 'gsk_REMOVED_FOR_SECURITY');
        
        let data = JSON.parse(scrubbed);
        if (data.nodes) {
           data.nodes.forEach(n => {
              if (n.credentials) {
                 // Clean actual credential objects
                 delete n.credentials;
              }
           });
        }
        fs.writeFileSync(f, JSON.stringify(data, null, 2));
        console.log('Scrubbed', f);
    } catch(e) {
        console.log('Skipping', f, e.message);
    }
  }
});
