// Orquestrador: converte os relatórios Markdown em PDF.
// Gera HTML intermediário em build/ e o PDF final em ../../pdf/.
//
// Uso: node build-pdfs.js
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..'); // nalida-discover/
const FINAL_DOCS = path.join(ROOT, 'final-docs');
const PDF_DIR = path.join(ROOT, 'pdf');
const BUILD_DIR = path.join(__dirname, 'build');

// Lista de documentos a converter: [arquivo .md, nome do PDF, título]
const DOCS = [
  [
    'relatorio-analise-frontend.md',
    'relatorio-analise-frontend.pdf',
    'Relatório de Análise de Interfaces — Nalida Web',
  ],
  [
    'relatorio-funcionalidades.md',
    'relatorio-funcionalidades.pdf',
    'Relatório de Funcionalidades — Nalida Web',
  ],
];

fs.mkdirSync(BUILD_DIR, { recursive: true });
fs.mkdirSync(PDF_DIR, { recursive: true });

const node = process.execPath;

for (const [mdName, pdfName, title] of DOCS) {
  const mdPath = path.join(FINAL_DOCS, mdName);
  const htmlPath = path.join(BUILD_DIR, mdName.replace(/\.md$/, '.html'));
  const pdfPath = path.join(PDF_DIR, pdfName);

  if (!fs.existsSync(mdPath)) {
    console.error(`Ignorado (não encontrado): ${mdPath}`);
    continue;
  }

  console.log(`\n=> ${mdName}`);
  execFileSync(node, [path.join(__dirname, 'md-to-html.js'), mdPath, htmlPath, title], {
    stdio: 'inherit',
  });
  execFileSync(node, [path.join(__dirname, 'html-to-pdf.js'), htmlPath, pdfPath], {
    stdio: 'inherit',
  });
}

console.log('\nConcluído. PDFs em: ' + PDF_DIR);
