import fs from "fs";
import path from "path";

const framesDir = path.join(process.cwd(), "public", "Frames");

// Asegurar que la carpeta existe antes de intentar leerla
if (!fs.existsSync(framesDir)) {
  console.error("❌ Error: La carpeta public/Frames no existe.");
  process.exit(1);
}

const output = path.join(process.cwd(), "public", "Frames", "manifest.json");

const allowed = [".png", ".jpg", ".jpeg", ".webp"];

const files = fs
  .readdirSync(framesDir)
  .filter((f) => allowed.includes(path.extname(f).toLowerCase()));

function extractNumber(name) {
  const match = name.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

files.sort((a, b) => {
  const na = extractNumber(a);
  const nb = extractNumber(b);

  if (na !== null && nb !== null) return na - nb;
  if (na !== null) return -1;
  if (nb !== null) return 1;

  return a.localeCompare(b);
});

const manifest = files.map((f) => `/Frames/${f}`);

fs.writeFileSync(output, JSON.stringify(manifest, null, 2));

console.log("✅ Manifest generado con", manifest.length, "frames en:", output);
