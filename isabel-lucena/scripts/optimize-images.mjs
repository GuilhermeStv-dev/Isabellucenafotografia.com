import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = path.resolve(process.cwd(), 'src', 'assets');
const outDir = path.resolve(root, 'optimized');

const files = [
  'foto-isabel.jpeg',
  'Foto-isabel-2.JPG',
  'Foto-isabel3.png',
  'Foto-Isabel4.png',
  'foto-gravida1.jpg',
];

const widths = [640, 1024, 1600];
const fallbackWidth = 1600;

await fs.mkdir(outDir, { recursive: true });

for (const file of files) {
  const inputPath = path.resolve(root, file);
  const ext = path.extname(file);
  const base = path.basename(file, ext).replace(/\s+/g, '-').toLowerCase();

  for (const width of widths) {
    const outPath = path.resolve(outDir, `${base}-${width}.webp`);

    await sharp(inputPath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toFile(outPath);

    console.log(`ok: ${path.relative(process.cwd(), outPath)}`);
  }

  const fallbackJpgPath = path.resolve(outDir, `${base}-${fallbackWidth}.jpg`);
  await sharp(inputPath)
    .rotate()
    .resize({ width: fallbackWidth, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(fallbackJpgPath);

  console.log(`ok: ${path.relative(process.cwd(), fallbackJpgPath)}`);
}

console.log('Concluído.');
