# Análise de Rotas — Bloco 5: Lessee — Dashboard e Cadastro de Espaço

> Documento gerado com base nos screenshots capturados em `docs/screenshots/bloco-5/` e nos documentos de requisitos existentes.
> Viewport de captura: **390 × 844px** (mobile — iPhone 14 Pro)

---

## Visão Geral

O bloco 5 cobre o modo **lessee** (proprietário de espaço): o dashboard de gerenciamento e o formulário multi-step de cadastro/edição de espaço. São 15 telas organizadas em dois sub-fluxos:

| Sub-fluxo | Rotas |
|-----------|-------|
| **Dashboard lessee** | `/private/lessee`, `/private/lessee/my-place`, `/private/lessee/faq` |
| **Formulário de espaço** (10 steps + resultado) | `form-place/initial-info` → `address` → `schedule` → `values` → `hour` → `discount` → `space-configs` → `rules` → `guests` → `images` → `result` |

> Dados do formulário são persistidos em `localStorage` sob a chave `@nalida/create-place` e no contexto `AddPlaceProvider`. O espaço só é criado no banco na etapa final (`images`).

---

## Sub-fluxo: Dashboard Lessee

### `/private/lessee`

<img src="./screenshots/bloco-5/lessee-redirect.png" alt="lessee-redirect" height="400" />

**Descrição**
Rota de entrada do modo lessee. Funciona como redirect automático para `/private/lessee/my-place`.

**Status de implementação:** ✅ Completo (apenas redirect)

---

### `/private/lessee/my-place`

<img src="./screenshots/bloco-5/lessee-my-place.png" alt="lessee-my-place" height="400" />

**Descrição**
Dashboard principal do proprietário. Lista todos os espaços cadastrados pelo usuário com ações de gerenciamento.

**Funcionalidades visíveis**
- Lista de espaços do usuário com foto, nome, categoria e status (ativo/inativo)
- Ações por espaço: editar, visualizar, deletar
- Botão "Adicionar espaço" → inicia o `form-place`
- Links para: agenda, reservas pendentes, reservas concluídas, estatísticas

**Fluxo de saída**
- "Adicionar espaço" → `/private/lessee/form-place/initial-info`
- "Editar" → `/private/lessee/form-place/initial-info/[uid]`
- "Estatísticas" → `/private/lessee/info-place/[uid]`
- "Agenda" → `/private/lessee/schedule`
- "Reservas pendentes" → `/private/lessee/approve-booking/[uid]`
- "Reservas concluídas" → `/private/lessee/completed-booking/[uid]`

**Dependências de dados**
- `GET /place?where[owner][uid]=:uid` — espaços do usuário logado

**Status de implementação:** ✅ Completo

---

### `/private/lessee/faq`

<img src="./screenshots/bloco-5/lessee-faq.png" alt="lessee-faq" height="400" />

**Descrição**
Perguntas frequentes para proprietários. Conteúdo estático com cards expansíveis.

**Funcionalidades visíveis**
- Lista de perguntas e respostas em accordion (expandir/recolher)
- Conteúdo estático — sem integração com API

**Status de implementação:** ✅ Completo

---

## Sub-fluxo: Formulário de Espaço (form-place)

> Barra de progresso visível em todas as etapas. Suporta criação (`/form-place/step`) e edição (`/form-place/step/[uid]`).

---

### Step 1 — `initial-info` (10%)

<img src="./screenshots/bloco-5/form-place-initial-info.png" alt="form-place-initial-info" height="400" />

**Campos**
- Nome do lugar (`title`) — obrigatório, capitalize
- Categoria (`category`) — select carregado de `GET /category` (apenas raízes)
- Subcategoria (`subCategory`) — filtrada dinamicamente pela categoria; desabilitada se sem opções
- Tipo de espaço (`spaceTypeUid`) — select carregado de `GET /spaceType`
- Lotação máxima (`maximumCapacity`) — numérico, mínimo 1

**Status de implementação:** ✅ Completo

---

### Step 2 — `address` (20%)

<img src="./screenshots/bloco-5/form-place-address.png" alt="form-place-address" height="400" />

**Campos**
- CEP (`zipCode`) — máscara; ao completar 8 dígitos consulta `GET /external/address/:cep` (Brasil API)
- Estado, Cidade, Bairro, Rua — preenchidos automaticamente via ViaCEP; desabilitados
- Número (`number`) — ao preencher dispara geocodificação via Google Maps → preenche `lat`/`lng`
- Complemento (`complement`) — opcional

**Status de implementação:** ✅ Completo

**Observações**
- Lat/lng calculados automaticamente via Google Maps Geocoding API ao informar o número
- Campos de endereço são somente leitura após preenchimento automático

---

### Step 3 — `schedule` (30%)

<img src="./screenshots/bloco-5/form-place-schedule.png" alt="form-place-schedule" height="400" />

**Campos**
- Dias de funcionamento (`schedule`) — checkboxes inline: Dom(0) Seg(1) Ter(2) Qua(3) Qui(4) Sex(5) Sab(6); mínimo 1
- Horário de entrada (`hours[0]`) — HourPicker
- Horário de saída (`hours[1]`) — desabilita horas ≤ entrada selecionada

**Status de implementação:** ✅ Completo

---

### Step 4 — `values` (40%)

<img src="./screenshots/bloco-5/form-place-values.png" alt="form-place-values" height="400" />

**Campos**
- Valor diária (`dailyRate`) — máscara R$, obrigatório
- Valor diária por hóspede adicional (`additionalGuestDay`) — máscara R$, obrigatório
- Taxa de limpeza (`cleeaningFee`) — máscara R$, obrigatório

**Status de implementação:** ✅ Completo

**Observações**
- Campo `cleeaningFee` tem typo no nome interno (dois `e`) — presente no código e na API

---

### Step 5 — `hour` (50%)

<img src="./screenshots/bloco-5/form-place-hour.png" alt="form-place-hour" height="400" />

**Campos**
- Permite reserva por hora? (`allowsBookPerHour`) — switcher `"true"/"false"`
- Valor hora (`hourRate`) — desabilitado se `allowsBookPerHour = false`
- Valor hora por hóspede adicional (`additionalGuestHour`) — desabilitado se `false`
- Estadia mínima em horas (`minimumStayInHours`) — mín. 1, máx. 24; desabilitado se `false`

**Status de implementação:** ✅ Completo

---

### Step 6 — `discount` (60%)

<img src="./screenshots/bloco-5/form-place-discount.png" alt="form-place-discount" height="400" />

**Campos**
- Oferece desconto para longas reservas? (`canDiscount`) — switcher
- Estadia mínima para desconto (`minimumStay`) — dias, mín. 1; desabilitado se `false`
- Percentual de desconto (`percentageDiscount`) — %, mín. 1; desabilitado se `false`

**Status de implementação:** ✅ Completo

---

### Step 7 — `space-configs` (70%)

<img src="./screenshots/bloco-5/form-place-space-configs.png" alt="form-place-space-configs" height="400" />

**Campos**
- Metragem (`size`) — numérico, sufixo "metros", mín. 1
- Número de banheiros (`numberOfBathrooms`) — numérico, mín. 0
- Velocidade da internet (`internetSpeed`) — numérico, sufixo "mbps", mín. 0
- Comodidades (`convenienceUid`) — toggle list com ícones por slug; seleção múltipla; carregado de `GET /conveniences`

**Status de implementação:** ✅ Completo

---

### Step 8 — `rules` (80%)

<img src="./screenshots/bloco-5/form-place-rules.png" alt="form-place-rules" height="400" />

**Campos**
- Política de cancelamento (`cancellationPolicyUid`) — select carregado de `GET /cancellation-policy`
- Texto da política — textarea somente leitura; preenchido com `body` da política selecionada
- Regras do espaço (`rule`) — textarea obrigatória, 8 linhas
- Instruções de check-in (`checkInInstruction`) — textarea obrigatória, 8 linhas

**Status de implementação:** ✅ Completo

---

### Step 9 — `guests` (85%)

<img src="./screenshots/bloco-5/form-place-guests.png" alt="form-place-guests" height="400" />

**Campos**
- Preferências de hóspedes (`guests`) — toggle list, seleção múltipla, sem validação obrigatória
  - `acceptOnlyRecommended` — aceitar só recomendados por outros anfitriões
  - `acceptOnlyAlreadyBooked` — aceitar só quem já fez reservas no app

**Status de implementação:** ✅ Completo

---

### Step 10 — `images` (90%)

<img src="./screenshots/bloco-5/form-place-images.png" alt="form-place-images" height="400" />

**Campos**
- Imagens do espaço (`images`) — input file, `image/*`, múltiplos arquivos, obrigatório (mín. 1)
- Preview das imagens selecionadas; primeira imagem é a capa
- Upload para Firebase Storage antes de salvar

**Fluxo de saída**
- Confirmar → `POST /place` (criação) ou `PATCH /place/:uid` (edição) → `/form-place/result`

**Status de implementação:** ⚠️ Parcial

**Observações**
- Sem validação de formato MIME, tamanho máximo por imagem ou quantidade máxima
- Sem moderação de conteúdo impróprio
- Etapa mais complexa do formulário — é aqui que o espaço é efetivamente criado/editado na API

---

### `result` (100%)

<img src="./screenshots/bloco-5/form-place-result.png" alt="form-place-result" height="400" />

**Descrição**
Tela de confirmação após criação ou edição bem-sucedida do espaço.

**Funcionalidades visíveis**
- Mensagem de sucesso com nome do espaço criado/editado
- Botão "Ver meus espaços" → `/private/lessee/my-place`

**Fluxo de saída**
- "Ver meus espaços" → `/private/lessee/my-place`

**Status de implementação:** ✅ Completo

**Observações**
- Limpa o `localStorage` (`@nalida/create-place`) ao carregar
- Espaço publicado diretamente — sem etapa de revisão ou moderação

---

## Mapa de Fluxo — Bloco 5

```
[/private/lessee/my-place]
        │
  "Adicionar espaço"
        │
        ▼
  initial-info (10%)
        │
  address (20%)
        │
  schedule (30%)
        │
  values (40%)
        │
  hour (50%)
        │
  discount (60%)
        │
  space-configs (70%)
        │
  rules (80%)
        │
  guests (85%)
        │
  images (90%) ──► POST /place ──► result (100%)
                                        │
                                  "Ver meus espaços"
                                        │
                                        ▼
                              /private/lessee/my-place
```

---

## Resumo de Status por Rota

| Rota | Status | Lacunas principais |
|------|:------:|-------------------|
| `/private/lessee` | ✅ | — |
| `/private/lessee/my-place` | ✅ | — |
| `/private/lessee/faq` | ✅ | — |
| `form-place/initial-info` | ✅ | — |
| `form-place/address` | ✅ | — |
| `form-place/schedule` | ✅ | — |
| `form-place/values` | ✅ | Typo em `cleeaningFee` |
| `form-place/hour` | ✅ | — |
| `form-place/discount` | ✅ | — |
| `form-place/space-configs` | ✅ | — |
| `form-place/rules` | ✅ | — |
| `form-place/guests` | ✅ | — |
| `form-place/images` | ⚠️ | Sem validação de MIME/tamanho; sem moderação |
| `form-place/result` | ✅ | Sem moderação antes de publicar |

---

## Funcionalidades Transversais do Bloco

| Funcionalidade | Status |
|----------------|:------:|
| Persistência em `localStorage` entre steps | ✅ |
| Barra de progresso multi-step | ✅ |
| Consulta de CEP (ViaCEP / Brasil API) | ✅ |
| Geocodificação de endereço (Google Maps) | ✅ |
| Upload de imagens (Firebase Storage) | ✅ |
| Validação de MIME e tamanho de imagem | ❌ |
| Moderação de conteúdo | ❌ |
| Suporte a criação e edição no mesmo formulário | ✅ |

---

## Navegação entre Blocos

| Bloco | Título | Entrada via |
|-------|--------|-------------|
| ← Bloco 1 | Autenticação | Toggle lessee/lessor no perfil |
| → Bloco 6 | Gestão de reservas (lessee) | Links em `my-place` (agenda, pendentes, concluídas) |
