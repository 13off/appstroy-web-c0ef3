const fs = require('fs');
const path = require('path');

const partsDir = path.join(__dirname, 'asset-data');
const outputDir = path.join(__dirname, 'assets');

const parts = fs
  .readdirSync(partsDir)
  .filter((name) => /^asset-\d+\.txt$/.test(name))
  .sort()
  .map((name) => fs.readFileSync(path.join(partsDir, name), 'utf8'));

const packedAssets = JSON.parse(parts.join(''));
const extensionByMime = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const publicAssets = {};
for (const [key, asset] of Object.entries(packedAssets)) {
  const extension = extensionByMime[asset.mime] || 'bin';
  const fileName = `${key}.${extension}`;
  fs.writeFileSync(path.join(outputDir, fileName), Buffer.from(asset.data, 'base64'));
  publicAssets[key] = `assets/${fileName}`;
}

fs.writeFileSync(
  path.join(__dirname, 'asset-map.js'),
  `window.__SKBS_ASSETS__ = ${JSON.stringify(publicAssets)};\n`,
  'utf8',
);

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(
  '<h1>Строим<br>кафедральный собор</h1>',
  '<h1>Кафедральный собор<br>в Мурманске</h1>',
);
html = html.replace(
  '<div class="vacancy-panel vacancy-panel-soon" hidden>\n            <p>Добавим условия, вакансии и дату ближайшего заезда.</p>\n          </div>',
  '<div class="vacancy-panel vacancy-panel-soon" hidden>\n            <p>Отдельный объект в Москве. Условия и дату заезда добавим позже.</p>\n          </div>',
);
html = html.replace(
  '<div class="vacancy-panel vacancy-panel-soon" hidden>\n            <p>Добавим условия, вакансии и дату ближайшего заезда.</p>\n          </div>',
  '<div class="vacancy-panel vacancy-panel-soon" hidden>\n            <p>Отдельный объект в Забайкалье — медный завод. Условия добавим позже.</p>\n          </div>',
);
html = html.replace(/\sdata-netlify="true"/g, '');
html = html.replace(/\snetlify-honeypot="company-site"/g, '');
html = html.replace(/\n\s*<input type="hidden" name="form-name" value="job-application">/g, '');
html = html.replace(/\n\s*<p class="hidden"><label>Не заполняйте <input name="company-site"><\/label><\/p>/g, '');
if (!html.includes('asset-map.js')) {
  html = html.replace(
    '<script src="script.js"></script>',
    '<script src="asset-map.js"></script>\n  <script src="script.js"></script>',
  );
}
fs.writeFileSync(indexPath, html, 'utf8');

fs.writeFileSync(path.join(__dirname, '.nojekyll'), '', 'utf8');
console.log(`Подготовлено изображений: ${Object.keys(publicAssets).length}`);
