# Screenshots das rotas (nalida-web)

Capturas geradas automaticamente com Playwright, organizadas por bloco.

## Como gerar

1. Suba o web **sem auth** (porta livre, ex.: 3001):

```bash
cd apps/nalida-web
SKIP_AUTH=true NEXT_PUBLIC_SKIP_AUTH=true npx next dev -p 3001
```

2. Instale o Chromium do Playwright (uma vez):

```bash
npx playwright install chromium
```

3. Capture um bloco:

```bash
node scripts/capture-screenshots.mjs --block=1 --base-url=http://localhost:3001
```

## Blocos

| Bloco | Conteúdo |
|-------|----------|
| 1 | Rotas públicas + login/cadastro |
| 2 | Home lessor (dashboard, more, place) |
| 3 | Fluxo de reserva |
| 4 | Conversas |
| 5 | Lessee — form-place |
| 6 | Lessee — gestão de reservas |
| 7 | Perfil |

Cada pasta `bloco-N/` contém PNGs + `manifest.json`.

## Desativar bypass de auth

Remova `SKIP_AUTH` e `NEXT_PUBLIC_SKIP_AUTH` do ambiente e reinicie o `next dev`.
