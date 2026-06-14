# Nalida MVP — Proposta de Escopo

Aplicação **Next.js (App Router) + Node** que visualiza o escopo proposto para o MVP da Nalida. Não usa banco de dados: todo o conteúdo é alimentado pelo arquivo `data/mvp.json`, servido por uma rota de API Node (`/api/mvp`).

## O que ela mostra

- **KPIs do MVP**: total de horas, investimento estimado, nº de funcionalidades e itens adiados/removidos.
- **Escopo por módulo**: cada módulo expansível, com as funcionalidades classificadas em:
  - 🟢 **No MVP** — será desenvolvido nesta fase
  - 🟡 **Adiada (v2)** — planejada para fase posterior
  - 🔴 **Removida** — fora do escopo atual
- **Filtros** por decisão e estimativa de horas/complexidade por funcionalidade.

## Como rodar

```bash
cd nalida-discover/proposta
npm install
npm run dev
```

Acesse http://localhost:3000

Para build de produção:

```bash
npm run build
npm start
```

## Sincronização com Google Sheets

A proposta pode ser sincronizada a partir de uma planilha pública do Google Sheets. O botão **⟳ Sincronizar planilha** (no topo) puxa o estado atual da planilha, faz o parse e grava em `data/mvp.json`.

### Como funciona

- A planilha é exportada como CSV (`/export?format=csv`) — **não precisa de credencial**, basta estar compartilhada como *"Qualquer pessoa com o link · Leitor"*.
- O endpoint Node `POST /api/sync` busca o CSV, interpreta seções e linhas e mescla no JSON.
- Mapeamento da coluna **Ação MVP**:
  - `Manter` → 🟢 No MVP (`included`)
  - `Remover` → 🔴 Removida (`removed`)
  - `Adiar` → 🟡 Adiada (`deferred`)
  - `Novo` → linha-placeholder ignorada
- A coluna **Estimativa (h)** vira as horas; a **Observação** vira a nota do card.
- Parâmetros do projeto (valor/hora, horas/dia, stack, abordagem) são **preservados** na sincronização.
- A planilha sincronizada fica registrada em `project.sheetId` / `project.sheetGid`.

### Layout esperado da planilha

| Coluna | Conteúdo |
|--------|----------|
| A | Código (`1.1`) ou título de seção (`1. Autenticação e Acesso`) |
| B | Funcionalidade / Requisito |
| C | Ação MVP (`Manter` / `Remover` / `Adiar`) |
| D | Estimativa em horas |
| E | Observação (opcional) |

### Sentido da sincronização

A sincronização é **planilha → app** (a planilha é a fonte de verdade). As edições feitas na interface salvam no `data/mvp.json` local. Escrever **de volta** no Google Sheets exigiria autenticação via *service account* (Google Sheets API) — não incluído aqui para manter o setup sem credenciais. Se quiser esse caminho de volta, dá pra adicionar com uma chave de service account.

## Editando o escopo

Toda a proposta vive em [`data/mvp.json`](./data/mvp.json). Ajuste:

- `project.hourlyRate` e `project.hoursPerDay` — base do cálculo de custo e prazo.
- `modules[].features[]` — cada funcionalidade tem:
  - `decision`: `included` | `deferred` | `removed`
  - `complexity`: `P` | `M` | `G` | `XG`
  - `hours`: estimativa (use `0` para itens removidos)
  - `notes`: observação opcional exibida no card

Os totais (horas, custo, prazo) são recalculados automaticamente a partir do JSON.

## Estrutura

```
proposta/
├── app/
│   ├── api/mvp/route.ts        # endpoint Node que serve o JSON
│   ├── components/             # ScopeExplorer + ModuleCard (client)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # server component (lê o JSON e calcula totais)
├── data/mvp.json               # fonte única do escopo
└── lib/                        # tipos e lógica de estimativa
```
