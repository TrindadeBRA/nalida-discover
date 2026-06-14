// Converte Markdown -> HTML standalone, preservando imagens (caminhos relativos
// resolvidos para file:// absolutos) e emojis (fontes nativas do sistema).
//
// Uso: node md-to-html.js <entrada.md> <saida.html> ["Título"]
const path = require('path');
const fs = require('fs');

// markdown-it é resolvido a partir do node_modules do monorepo nalida-app-monorepo.
// Ajuste MD_LIB caso a estrutura de pastas mude.
const MD_LIB = path.resolve(
  __dirname,
  '../../../nalida-app-monorepo/node_modules/markdown-it'
);
const MarkdownIt = require(MD_LIB);

const md = new MarkdownIt({
  html: true, // permite <img>, <a id> etc. já presentes nos .md
  linkify: true,
  typographer: false,
  breaks: false,
});

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const title = process.argv[4] || path.basename(inputPath, '.md');

if (!inputPath || !outputPath) {
  console.error('Uso: node md-to-html.js <entrada.md> <saida.html> ["Título"]');
  process.exit(1);
}

const baseDir = path.dirname(path.resolve(inputPath));
let source = fs.readFileSync(inputPath, 'utf8');

// Resolve caminhos relativos de imagens em tags <img src="..."> para file:// absoluto
source = source.replace(/<img([^>]*?)src="([^"]+)"/g, (m, pre, src) => {
  if (/^(https?:|file:|data:)/.test(src)) return m;
  const abs = path.resolve(baseDir, src);
  return `<img${pre}src="file://${abs}"`;
});

// Resolve também imagens em sintaxe markdown ![alt](src)
source = source.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => {
  if (/^(https?:|file:|data:)/.test(src)) return m;
  const clean = src.split(' ')[0];
  const abs = path.resolve(baseDir, clean);
  return `![${alt}](file://${abs})`;
});

const body = md.render(source);

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", "Noto Sans", "Noto Color Emoji", "Helvetica Neue", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1f2933;
    max-width: 100%;
    margin: 0;
  }
  h1, h2, h3, h4, h5, h6 { color: #0b3d59; line-height: 1.25; margin-top: 1.4em; margin-bottom: 0.5em; font-weight: 600; }
  h1 { font-size: 22pt; border-bottom: 3px solid #0b3d59; padding-bottom: 0.25em; }
  h2 { font-size: 17pt; border-bottom: 1px solid #cbd5e0; padding-bottom: 0.2em; }
  h3 { font-size: 14pt; }
  h4 { font-size: 12pt; }
  p { margin: 0.5em 0; }
  a { color: #2563eb; text-decoration: none; }
  code {
    font-family: "Fira Code", "Cascadia Code", Consolas, monospace;
    background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.88em;
    color: #be185d;
  }
  pre {
    background: #0f172a; color: #e2e8f0; padding: 14px 16px; border-radius: 8px;
    overflow-x: auto; font-size: 9pt; line-height: 1.4; page-break-inside: avoid;
  }
  pre code { background: transparent; color: inherit; padding: 0; }
  table {
    border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td { border: 1px solid #cbd5e0; padding: 6px 9px; text-align: left; vertical-align: top; }
  th { background: #0b3d59; color: #fff; font-weight: 600; }
  tr:nth-child(even) td { background: #f8fafc; }
  img { max-width: 300px; height: auto; display: block; margin: 0.6em 0; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; }
  blockquote {
    border-left: 4px solid #38bdf8; background: #f0f9ff; margin: 1em 0;
    padding: 0.5em 1em; color: #334155;
  }
  hr { border: none; border-top: 1px solid #cbd5e0; margin: 1.6em 0; }
  ul, ol { margin: 0.5em 0; padding-left: 1.6em; }
  li { margin: 0.2em 0; }
</style>
</head>
<body>
${body}
</body>
</html>`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log('HTML gerado: ' + outputPath);
