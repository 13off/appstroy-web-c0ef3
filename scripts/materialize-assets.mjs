import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'assets');
fs.mkdirSync(outputDir, { recursive: true });

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function extractDataUri(relativePath) {
  const text = read(relativePath);
  const match = text.match(/base64,([A-Za-z0-9+/=]+)["']/);
  if (!match) throw new Error(`Не найдены данные изображения в ${relativePath}`);
  return match[1];
}

function extractChunk(relativePath) {
  const text = read(relativePath);
  const match = text.match(/\.push\(["']([A-Za-z0-9+/=]+)["']\)/);
  if (!match) throw new Error(`Не найден фрагмент изображения в ${relativePath}`);
  return match[1];
}

function writeWebp(filename, base64) {
  const buffer = Buffer.from(base64, 'base64');
  const riff = buffer.subarray(0, 4).toString('ascii');
  const webp = buffer.subarray(8, 12).toString('ascii');
  if (riff !== 'RIFF' || webp !== 'WEBP') {
    throw new Error(`${filename}: получился некорректный WebP (${riff}/${webp}, ${buffer.length} байт)`);
  }
  const target = path.join(outputDir, filename);
  fs.writeFileSync(target, buffer);
  console.log(`Создан ${path.relative(root, target)} — ${buffer.length} байт`);
}

writeWebp('hero.webp', extractDataUri('asset-data-v4/hero.js'));
writeWebp('room.webp', extractDataUri('asset-data-v4/room.js'));
writeWebp(
  'hotel.webp',
  [extractChunk('chunks/hotel-0.js'), extractChunk('chunks/hotel-1.js')].join('')
);
