import fs from "fs";
import path from "path";

const framesDir = path.join(process.cwd(), "public", "Frames");

if (!fs.existsSync(framesDir)) {
  console.error("❌ Error: La carpeta public/Frames no existe.");
  process.exit(1);
}

const files = fs.readdirSync(framesDir);
const allowed = [".png", ".jpg", ".jpeg", ".webp"];

let count = 0;

files.forEach((file) => {
  const ext = path.extname(file).toLowerCase();
  if (!allowed.includes(ext)) return;

  const match = file.match(/\d+/);
  if (!match) return;

  const num = match[0].padStart(3, "0");
  const newName = `frame_${num}${ext}`;
  
  if (file !== newName) {
    fs.renameSync(path.join(framesDir, file), path.join(framesDir, newName));
    count++;
  }
});

console.log(`✅ Renombrados ${count} archivos a formato 'frame_XXX'`);
