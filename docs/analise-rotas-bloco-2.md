# Análise de Rotas — Bloco 2: Home Lessor (Dashboard e Espaços)

> Documento gerado com base nos screenshots capturados em `docs/screenshots/bloco-2/` e nos documentos de requisitos existentes.
> Viewport de captura: **390 × 844px** (mobile — iPhone 14 Pro)

---

## Visão Geral

O bloco 2 cobre o fluxo principal do modo **lessor** (quem busca e aluga espaços): desde o dashboard de descoberta até a tela de detalhe de um espaço. São 3 telas que formam o núcleo da experiência de busca da plataforma.

| Rota | Nome | Descrição |
|------|------|-----------|
| `/private` | Home | Dashboard principal com espaços por categoria |
| `/private/more` | More | Listagem completa de uma categoria com filtros e mapa |
| `/private/place?uid=` | Place | Detalhe completo de um espaço |

---

## Rotas Privadas — Modo Lessor

### `/private`

<img src="./screenshots/bloco-2/private-home.png" alt="private-home" height="400" />

**Descrição**
Dashboard principal do modo lessor. Ponto de entrada após o onboarding. Exibe espaços agrupados por categoria, priorizando os mais próximos ao usuário.

**Funcionalidades visíveis**
- Campo de busca por texto (cidade ou bairro) no topo
- Seções por categoria (ex: Clínicas de Saúde, Salas de Estudo, Escritórios)
- Até 5 cards de espaços por categoria
- Link "Ver mais" por categoria → `/private/more?category=&slug=`
- Card de espaço com: foto, nome, tipo, preço e distância
- Geolocalização automática via `LocationProvider` para ordenar por proximidade
- Navbar inferior com ícones de navegação

**Fluxo de saída**
- Clicar em card de espaço → `/private/place?uid=`
- Clicar em "Ver mais" → `/private/more?category=&slug=`
- Campo de busca → `/private/more` com filtro de texto

**Dependências de dados**
- `GET /place/near?lat=&lng=&maxDistance=10000&include[category]=true&include[spaceType]=true` — chamado uma vez por categoria
- Coordenadas vindas do `LocationProvider` (capturadas em `/welcome`)

**Status de implementação:** ✅ Completo

**Observações**
- Se o usuário negou geolocalização em `/welcome`, a ordenação por proximidade não funciona — sem fallback visível
- Múltiplas queries paralelas por categoria (uma por grupo exibido)
- Máximo de 5 resultados por categoria — sem paginação inline, apenas via "Ver mais"

---

### `/private/more`

<img src="./screenshots/bloco-2/private-more.png" alt="private-more" height="400" />

**Descrição**
Listagem completa de espaços de uma categoria específica. Oferece filtros avançados e alternância entre visualização em lista e mapa.

**Funcionalidades visíveis**
- Header com nome da categoria e contagem de resultados
- Toggle lista / mapa
- Painel de filtros: faixa de preço (slider), comodidades, distância máxima
- Cards de espaços com foto, nome, tipo, preço e distância
- Paginação com botão "Ver mais" ou scroll infinito
- Campo de busca por texto herdado do dashboard

**Fluxo de saída**
- Clicar em card → `/private/place?uid=`
- Toggle mapa → renderiza Google Maps com marcadores
- Clicar em marcador no mapa → popup com card resumido → `/private/place?uid=`
- Voltar → `/private`

**Dependências de dados**
- `GET /place?where[category][slug]=:slug&lat=&lng=&page=1&size=10`
- Filtros de preço e distância processados no cliente
- Comodidades enviadas como parâmetro de query

**Status de implementação:** ⚠️ Parcial

**Observações**
- Filtro de faixa de preço e distância máxima são processados **no cliente** — sem operadores `gte`/`lte` no backend
- Busca por texto funciona apenas como correspondência exata de campo — sem full-text search no backend
- Visualização em mapa depende de `geoLocation.lat` e `geoLocation.lng` presentes em cada espaço

---

### `/private/place?uid=`

<img src="./screenshots/bloco-2/private-place.png" alt="private-place" height="400" />

**Descrição**
Tela de detalhe completo de um espaço. Concentra todas as informações necessárias para o usuário decidir se vai reservar.

**Funcionalidades visíveis**
- Galeria de fotos (carrossel)
- Nome, tipo de espaço e categoria
- Endereço e mapa de localização (Google Maps estático)
- Capacidade máxima, número de banheiros, tamanho em m², velocidade de internet
- Preços: diária, hora (se habilitado), hóspede adicional, taxa de limpeza
- Comodidades com ícones
- Regras do espaço
- Política de cancelamento
- Instruções de check-in
- Avaliação média (estrelas + número de avaliações)
- Botão "Reservar" fixo no rodapé

**Fluxo de saída**
- Botão "Reservar" → `/private/booking/calendar?uid=`
- Voltar → `/private/more` ou `/private`

**Dependências de dados**
- `GET /place/:uid?include[conveniences]=true&include[spaceType]=true&include[category]=true`
- `GET /rating/average/:uid` — para exibir a nota média

**Status de implementação:** ✅ Completo

**Observações**
- Preço por hora só aparece se `allowsBookPerHour = true` no espaço
- Avaliação média calculada no backend via `GET /rating/average/:uid`
- Mapa exibe a localização exata do espaço com `geoLocation.lat` e `geoLocation.lng`

---

## Mapa de Fluxo — Bloco 2

```
[/welcome ou navbar]
        │
        ▼
    /private (home)
        │
        ├── "Ver mais" por categoria ──► /private/more?category=&slug=
        │                                        │
        │                              ┌─────────┴──────────┐
        │                           lista                  mapa
        │                              │                    │
        │                         card de espaço      marcador no mapa
        │                              │                    │
        └── card de espaço ────────────┴────────────────────┘
                                       │
                                       ▼
                              /private/place?uid=
                                       │
                                  "Reservar"
                                       │
                                       ▼
                           /private/booking/calendar?uid=
                                  (Bloco 3)
```

---

## Resumo de Status por Rota

| Rota | Status | Lacunas principais |
|------|:------:|-------------------|
| `/private` | ✅ | Sem fallback quando geolocalização é negada |
| `/private/more` | ⚠️ | Filtros de preço/distância no cliente; sem full-text search |
| `/private/place?uid=` | ✅ | — |

---

## Funcionalidades Transversais do Bloco

| Funcionalidade | Onde aparece | Status |
|----------------|-------------|:------:|
| Geolocalização para ordenação por proximidade | `/private`, `/private/more` | ⚠️ (depende de permissão) |
| Busca por texto (cidade/bairro) | `/private`, `/private/more` | ⚠️ (sem full-text search) |
| Filtros avançados (preço, comodidades, distância) | `/private/more` | ⚠️ (processados no cliente) |
| Mapa interativo com marcadores (Google Maps) | `/private/more` | ✅ |
| Avaliação média do espaço | `/private/place` | ✅ |
| Paginação de resultados | `/private/more` | ✅ |
| Galeria de fotos (carrossel) | `/private/place` | ✅ |

---

## Navegação entre Blocos

| Bloco | Título | Entrada via |
|-------|--------|-------------|
| ← Bloco 1 | Rotas públicas e autenticação | `/login` → `/welcome` → `/private` |
| → Bloco 3 | Fluxo de reserva (lessor) | Botão "Reservar" em `/private/place` |
