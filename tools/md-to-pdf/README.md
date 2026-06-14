# md-to-pdf — Conversor de Relatórios Markdown → PDF

Ferramenta para converter os relatórios em Markdown da pasta `final-docs/` em PDF,
**preservando imagens e emojis**. A conversão usa o Chromium headless (via Playwright)
para renderizar o HTML, garantindo que screenshots e emojis apareçam exatamente como
no navegador.

## Estrutura

```
tools/md-to-pdf/
├── md-to-html.js     # Markdown -> HTML (resolve caminhos de imagem e aplica estilo)
├── html-to-pdf.js    # HTML -> PDF (Chromium headless)
├── build-pdfs.js     # Orquestrador: roda os dois passos para todos os relatórios
├── build/            # HTML intermediário (gerado; pode ser apagado)
└── README.md
```

Os PDFs finais são gravados em `nalida-discover/pdf/`.

## Pré-requisitos

- **Node.js** (testado com v24)
- **markdown-it** — resolvido automaticamente a partir de
  `nalida-app-monorepo/node_modules/markdown-it`. Os dois repositórios precisam
  estar lado a lado (`Nalida/nalida-app-monorepo` e `Nalida/nalida-discover`).
- **Chromium do Playwright** — detectado automaticamente em
  `~/.cache/ms-playwright/chromium-*`. Caso não exista, instale com:

  ```bash
  npx playwright install chromium
  ```

  Alternativamente, defina a variável de ambiente `CHROMIUM_BIN` apontando para
  qualquer executável Chrome/Chromium.

## Uso

### Gerar todos os PDFs de uma vez (recomendado)

A partir desta pasta (`tools/md-to-pdf`):

```bash
node build-pdfs.js
```

Isso gera, em `nalida-discover/pdf/`:

- `relatorio-analise-frontend.pdf`
- `relatorio-funcionalidades.pdf`

### Converter um arquivo avulso

```bash
# 1) Markdown -> HTML
node md-to-html.js ../../final-docs/relatorio-analise-frontend.md ./build/saida.html "Título do Documento"

# 2) HTML -> PDF
node html-to-pdf.js ./build/saida.html ../../pdf/saida.pdf
```

## Adicionar um novo relatório ao build

Edite o array `DOCS` em `build-pdfs.js`:

```js
const DOCS = [
  ['arquivo.md', 'arquivo.pdf', 'Título exibido no PDF'],
  // ...
];
```

Os caminhos `.md` são relativos a `final-docs/` e os `.pdf` saem em `pdf/`.

## Como imagens e emojis são preservados

- **Imagens:** o `md-to-html.js` reescreve caminhos relativos (ex.: `../docs/screenshots/...`)
  para URLs `file://` absolutas antes de renderizar, então o Chromium carrega cada PNG
  diretamente do disco e o embute no PDF.
- **Emojis:** são renderizados pela engine do Chromium usando as fontes de emoji do
  sistema (ex.: Noto Color Emoji), preservando ✅ ⚠️ ❌ etc.

## Observações

- A pasta `build/` contém apenas artefatos intermediários e pode ser apagada a qualquer momento.
- O `relatorio-analise-frontend.pdf` é grande (~10 MB) por conter todas as screenshots.
