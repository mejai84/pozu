const fetch = globalThis.fetch;

async function checkDb() {
  const url = 'https://api.pozu2.com/rest/v1/products?select=*';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzQwNDA5MzksImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.htEcAc2Nxr4gm1OYU7dyidcd7vSaBLF6CRs_FWpfiNc';
  
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const json = await res.json();
    console.log("TOTAL PRODUCTOS EN SUPABASE:", json.length);
    json.forEach(p => {
      console.log(`- ${p.name}`);
    });
  } catch (e) {
    console.error(e);
  }
}

checkDb();
