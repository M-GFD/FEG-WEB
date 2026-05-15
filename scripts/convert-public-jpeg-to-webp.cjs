/**
 * Convierte .jpg/.jpeg en public/ a .webp (quality 85) y elimina los originales.
 * Ejecutar desde la raíz: node scripts/convert-public-jpeg-to-webp.cjs
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const publicDir = path.join(__dirname, "..", "public");

async function main() {
  const jpegFiles = fs
    .readdirSync(publicDir)
    .filter((f) => /\.(jpe?g)$/i.test(f));

  for (const f of jpegFiles) {
    const inPath = path.join(publicDir, f);
    const base = f.replace(/\.(jpe?g)$/i, "");
    const outPath = path.join(publicDir, `${base}.webp`);
    await sharp(inPath).webp({ quality: 85, effort: 4 }).toFile(outPath);
    console.log("OK", path.basename(outPath));
  }

  const five = path.join(publicDir, "feg image (5).webp");
  if (!fs.existsSync(five)) {
    const one = path.join(publicDir, "feg image (1).webp");
    if (fs.existsSync(one)) {
      await sharp(one).webp({ quality: 85, effort: 4 }).toFile(five);
      console.log("OK feg image (5).webp (desde (1), placeholder)");
    }
  }

  for (const f of jpegFiles) {
    fs.unlinkSync(path.join(publicDir, f));
    console.log("removed", f);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
