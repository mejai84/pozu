const fs = require('fs');

// Función simple para parsear .env
function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  });
  return env;
}

const envConfig = parseEnv('d:/Jaime/Antigravity/Pozu/.env.local');
const inputPath = 'c:/Users/Cesar/Downloads/Pozu_FIXED_EXPRESSIONS (5).json';
const outputPath = 'c:/Users/Cesar/Downloads/Pozu_WORKFLOW_FINAL_FUNCIONAL.json';

try {
  let wfContent = fs.readFileSync(inputPath, 'utf8');

  // Reemplazar placeholders por valores reales de .env.local
  const replacements = {
    'GROQ_API_KEY_PLACEHOLDER': envConfig.GROQ_API_KEY,
    'TELEGRAM_BOT_TOKEN_PLACEHOLDER': envConfig.TELEGRAM_BOT_TOKEN,
    'OPENAI_API_KEY_PLACEHOLDER': envConfig.OPENAI_API_KEY || envConfig.GROQ_API_KEY,
    '<__PLACEHOLDER_VALUE__Replace this placeholder with your actual Supabase Service Role Key from Panel Supabase → Settings → API → service_role__>': envConfig.SUPABASE_SERVICE_ROLE_KEY
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    if (value) {
      console.log(`Reemplazando ${placeholder}...`);
      wfContent = wfContent.split(placeholder).join(value);
    }
  }

  fs.writeFileSync(outputPath, wfContent);
  console.log(`\n✅ Workflow "hidratado" con éxito en: ${outputPath}`);

} catch (error) {
  console.error("Error:", error.message);
}

