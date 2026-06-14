// Converte HTML -> PDF usando o Chromium headless do Playwright.
// Preserva imagens e emojis renderizando via engine nativa do Chromium.
//
// Uso: node html-to-pdf.js <entrada.html> <saida.pdf>
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Uso: node html-to-pdf.js <entrada.html> <saida.pdf>');
  process.exit(1);
}

// Localiza o executável do Chromium do Playwright instalado no cache do usuário.
function findChromium() {
  const cacheDir = path.join(
    process.env.HOME || require('os').homedir(),
    '.cache/ms-playwright'
  );
  if (!fs.existsSync(cacheDir)) return null;
  const dirs = fs
    .readdirSync(cacheDir)
    .filter((d) => d.startsWith('chromium-'))
    .sort()
    .reverse();
  for (const d of dirs) {
    const candidate = path.join(cacheDir, d, 'chrome-linux64', 'chrome');
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const chromePath = process.env.CHROMIUM_BIN || findChromium();
if (!chromePath) {
  console.error(
    'Chromium não encontrado. Instale com: npx playwright install chromium\n' +
      'ou defina a variável CHROMIUM_BIN apontando para o executável.'
  );
  process.exit(1);
}

const absInput = path.resolve(inputPath);
const absOutput = path.resolve(outputPath);

execFileSync(
  chromePath,
  [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    `--print-to-pdf=${absOutput}`,
    `file://${absInput}`,
  ],
  { stdio: 'inherit' }
);

console.log('PDF gerado: ' + absOutput);
