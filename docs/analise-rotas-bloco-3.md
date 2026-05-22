# Análise de Rotas — Bloco 3: Fluxo de Reserva (Lessor)

> Documento gerado com base nos screenshots capturados em `docs/screenshots/bloco-3/` e nos documentos de requisitos existentes.
> Viewport de captura: **390 × 844px** (mobile — iPhone 14 Pro)

---

## Visão Geral

O bloco 3 cobre o fluxo completo de reserva do ponto de vista do **locatário (lessor)**: desde a seleção de datas até o acompanhamento e cancelamento da reserva. São 7 telas organizadas em dois sub-fluxos:

| Sub-fluxo | Rotas |
|-----------|-------|
| **Criação de reserva** (4 etapas) | `booking/calendar`, `booking/hours`, `booking/guests`, `booking/confirm` |
| **Gestão de reservas** | `/private/reservations`, `/private/status-book/[uid]`, `/private/status-book/cancel` |

---

## Sub-fluxo: Criação de Reserva

### `/private/booking/calendar?uid=`

<img src="./screenshots/bloco-3/booking-calendar.png" alt="booking-calendar" height="400" />

**Descrição**
Primeira etapa da reserva. Seleção de datas com calendário interativo que bloqueia dias indisponíveis.

**Funcionalidades visíveis**
- Calendário mensal com navegação entre meses
- Dias passados desabilitados
- Dias já reservados (status `CONFIRMED` ou `IN_PROGRESS`) bloqueados visualmente
- Seleção de intervalo de datas (check-in / check-out)
- Exibição de desconto para reservas longas (quando `canDiscount = true` e mínimo de dias atingido)
- Cálculo de preço em tempo real conforme seleção
- Botão "Avançar" habilitado apenas após seleção válida

**Fluxo de saída**
- Espaço com `allowsBookPerHour = true` → `/private/booking/hours?uid=`
- Espaço com `allowsBookPerHour = false` → `/private/booking/guests?uid=`

**Dependências de dados**
- `GET /place/:uid` — inclui `availability` e bookings existentes para bloquear datas
- Dados de desconto: `canDiscount`, `minimumStay`, `percentageDiscount` do espaço
- Datas selecionadas salvas no `BookingProvider` (contexto em memória)

**Status de implementação:** ✅ Completo

**Observações**
- Validação de disponibilidade ocorre também no backend no momento de criar a reserva (`checkAvailability()`)
- Desconto exibido apenas quando o número de dias selecionados atinge `minimumStay`

---

### `/private/booking/hours?uid=`

<img src="./screenshots/bloco-3/booking-hours.png" alt="booking-hours" height="400" />

**Descrição**
Segunda etapa (opcional). Seleção de horário de entrada e saída para espaços que permitem reserva por hora.

**Funcionalidades visíveis**
- Seletor de horário de entrada (respeita horário de abertura do espaço)
- Seletor de horário de saída (desabilita horas ≤ horário de entrada)
- Toggle "Reservar dia inteiro" — preenche automaticamente com horário completo de funcionamento
- Atualização dinâmica do preço total conforme horários selecionados
- Resumo de datas selecionadas na etapa anterior

**Fluxo de saída**
- Avançar → `/private/booking/guests?uid=`
- Voltar → `/private/booking/calendar?uid=`

**Dependências de dados**
- `schedule` do espaço (dias e horários de funcionamento) para limitar as opções
- Horários salvos no `BookingProvider`

**Status de implementação:** ✅ Completo

**Observações**
- Tela só aparece se `allowsBookPerHour = true` no espaço
- Horário de saída é dinamicamente desabilitado para valores ≤ horário de entrada selecionado

---

### `/private/booking/guests?uid=`

<img src="./screenshots/bloco-3/booking-guests.png" alt="booking-guests" height="400" />

**Descrição**
Terceira etapa. Define quantos hóspedes adicionais além do titular utilizarão o espaço.

**Funcionalidades visíveis**
- Input numérico com botões de incremento/decremento
- Limite máximo baseado em `maximumCapacity` do espaço
- Valor por hóspede adicional exibido (diária ou hora, conforme tipo de reserva)
- Custo adicional calculado e exibido em tempo real
- Resumo acumulado das etapas anteriores

**Fluxo de saída**
- Avançar → `/private/booking/confirm?uid=`
- Voltar → `/private/booking/hours?uid=` ou `/private/booking/calendar?uid=`

**Dependências de dados**
- `maximumCapacity`, `additionalGuestDay`, `additionalGuestHour` do espaço
- Valor salvo no `BookingProvider` como `details.additionalGuests`

**Status de implementação:** ✅ Completo

---

### `/private/booking/confirm?uid=`

<img src="./screenshots/bloco-3/booking-confirm.png" alt="booking-confirm" height="400" />

**Descrição**
Quarta e última etapa da criação. Resumo completo da reserva com seleção de forma de pagamento e confirmação final.

**Funcionalidades visíveis**
- Resumo do espaço: nome, foto, endereço
- Discriminação detalhada de valores:
  - Diária ou hora × número de dias/horas
  - Hóspedes adicionais × valor unitário
  - Taxa de limpeza
  - Desconto (quando aplicável)
  - **Total final**
- Lista de cartões de crédito cadastrados no perfil para seleção
- Botão "Confirmar reserva" — envia para a API

**Fluxo de saída**
- Confirmar → `POST /booking` → `/private/status-book/[uid]`
- Voltar → `/private/booking/guests?uid=`

**Dependências de dados**
- Todos os dados acumulados no `BookingProvider` (datas, horários, hóspedes)
- `GET /user/:uid` — para listar cartões cadastrados (`paymentMethods`)
- `POST /booking` com: `placeUid`, `userUid`, `paymentIuid`, `details`, `totalPrice`, `bookingType`

**Status de implementação:** ⚠️ Parcial

**Observações**
- Reserva criada com status `PENDING` — aguarda aprovação do proprietário
- **Pagamento não é processado**: toda a infraestrutura de campos existe (`acquirerOrderUid`, `paymentStatus`), mas nenhum gateway está integrado
- O `totalPrice` enviado é calculado no frontend — sem validação server-side do valor

---

## Sub-fluxo: Gestão de Reservas

### `/private/reservations`

<img src="./screenshots/bloco-3/reservations.png" alt="reservations" height="400" />

**Descrição**
Painel do locatário com todas as suas reservas, organizadas por status em abas.

**Funcionalidades visíveis**
- Aba **Ativas**: reservas com status `PENDING`, `CONFIRMED`, `PROCESSING`, `IN_PROGRESS`
- Aba **Inativas**: reservas com status `CANCELED`, `REJECTED`
- Aba **Anteriores**: reservas com status `COMPLETED`
- Card de cada reserva: foto do espaço, nome, datas, status com cor correspondente
- Botão "Avaliar" nas reservas concluídas → abre modal de avaliação inline
- Modal de avaliação: critérios (Ambiente, Comodidades, Geral, Localização, Atendimento) + comentário

**Fluxo de saída**
- Clicar em reserva → `/private/status-book/[uid]`
- Botão "Avaliar" → modal inline → `POST /rating`

**Dependências de dados**
- `GET /user/:uid?select[booking]=true` — bookings do usuário
- Para cada booking: `GET /place/:uid` — dados do espaço
- `POST /rating` — para submeter avaliação

**Status de implementação:** ⚠️ Parcial

**Observações**
- Avaliação funciona apenas para espaços — sem fluxo para avaliar o proprietário (backend suporta `ratingType: owner`, mas não há UI)
- Carregamento de dados do espaço feito individualmente por booking — pode gerar múltiplas requisições

---

### `/private/status-book/[uid]`

<img src="./screenshots/bloco-3/status-book-detail.png" alt="status-book-detail" height="400" />

**Descrição**
Tela de detalhe de uma reserva específica. Exibe o estado atual e todas as informações da reserva.

**Funcionalidades visíveis**
- Dados do espaço: nome, foto, endereço
- Datas e horários da reserva
- Hóspedes adicionais
- Comodidades do espaço
- Regras e política de cancelamento
- Instruções de check-in
- Mapa de localização
- Status com cor correspondente:
  - `PENDING` → laranja → "Aguardando confirmação..."
  - `CONFIRMED` → verde → "Reserva confirmada"
  - `REJECTED` → vermelho → "Reserva rejeitada"
  - `COMPLETED` → "Reserva concluída"
  - `CANCELED` → "Reserva cancelada"
- Botão "Conversar com o anfitrião" → `/private/conversations/chat/[uid]`
- Botão "Cancelar reserva" → `/private/status-book/cancel?uid=`

**Fluxo de saída**
- "Conversar com o anfitrião" → `/private/conversations/chat/[uid]`
- "Cancelar reserva" → `/private/status-book/cancel?uid=`
- Voltar → `/private/reservations`

**Dependências de dados**
- `GET /booking/:uid` — dados completos da reserva
- `GET /place/:uid` — dados do espaço vinculado

**Status de implementação:** ✅ Completo

**Observações**
- Bug conhecido: botão "Cancelar reserva" aparece apenas para reservas com status `COMPLETED` — deveria aparecer para `CONFIRMED`

---

### `/private/status-book/cancel?uid=`

<img src="./screenshots/bloco-3/status-book-cancel.png" alt="status-book-cancel" height="400" />

**Descrição**
Fluxo de cancelamento de uma reserva. Exibe a política de cancelamento e solicita confirmação antes de enviar.

**Funcionalidades visíveis**
- Resumo da reserva a ser cancelada (espaço, datas)
- Texto da política de cancelamento do espaço
- Campo de motivo do cancelamento (texto livre)
- Botão "Confirmar cancelamento"
- Botão "Voltar"

**Fluxo de saída**
- Confirmar → `PATCH /booking/:uid` com `bookingStatus: CANCELED` → `/private/reservations`
- Voltar → `/private/status-book/[uid]`

**Dependências de dados**
- `uid` da reserva via query param
- `PATCH /booking/:uid` com `{ bookingStatus: "CANCELED" }`

**Status de implementação:** ⚠️ Parcial

**Observações**
- Política de cancelamento exibida é apenas **visual** — nenhuma regra é aplicada (prazo mínimo, multa, estorno)
- Motivo do cancelamento não é persistido no backend
- Sem notificação ao proprietário após o cancelamento

---

## Mapa de Fluxo — Bloco 3

```
[/private/place?uid=]
        │
   "Reservar"
        │
        ▼
booking/calendar ──► booking/hours (se allowsBookPerHour)
        │                   │
        └───────────────────┘
                │
                ▼
        booking/guests
                │
                ▼
        booking/confirm
                │
          POST /booking
                │
                ▼
     /private/status-book/[uid]
                │
     ┌──────────┴──────────┐
     │                     │
"Conversar"           "Cancelar"
     │                     │
     ▼                     ▼
conversations/      status-book/cancel
chat/[uid]               │
                    PATCH /booking
                         │
                         ▼
                  /private/reservations
                         │
                  ┌──────┴──────┐
                  │             │
              card de       "Avaliar"
              reserva          │
                  │        modal inline
                  │        POST /rating
                  ▼
          status-book/[uid]
```

---

## Resumo de Status por Rota

| Rota | Status | Lacunas principais |
|------|:------:|-------------------|
| `/private/booking/calendar` | ✅ | — |
| `/private/booking/hours` | ✅ | — |
| `/private/booking/guests` | ✅ | — |
| `/private/booking/confirm` | ⚠️ | Pagamento não processado; total calculado só no frontend |
| `/private/reservations` | ⚠️ | Sem avaliação de proprietário; múltiplas requisições por booking |
| `/private/status-book/[uid]` | ✅ | Bug: botão cancelar aparece no status errado |
| `/private/status-book/cancel` | ⚠️ | Política de cancelamento apenas visual; motivo não persistido |

---

## Funcionalidades Transversais do Bloco

| Funcionalidade | Onde aparece | Status |
|----------------|-------------|:------:|
| Cálculo dinâmico de preço | `calendar`, `hours`, `guests`, `confirm` | ✅ |
| Persistência em `BookingProvider` (contexto) | Todo o fluxo de criação | ✅ |
| Verificação de disponibilidade (frontend + backend) | `calendar` | ✅ |
| Processamento de pagamento (gateway) | `confirm` | ❌ |
| Avaliação de espaço pós-reserva | `reservations` (modal) | ✅ |
| Avaliação de proprietário | — | ❌ (não implementado) |
| Notificação de cancelamento | `cancel` | ❌ |
| Aplicação de política de cancelamento | `cancel` | ❌ |

---

## Navegação entre Blocos

| Bloco | Título | Entrada via |
|-------|--------|-------------|
| ← Bloco 2 | Home lessor (dashboard e espaços) | Botão "Reservar" vem de `/private/place` |
| → Bloco 4 | Conversas | Botão "Conversar com o anfitrião" em `status-book/[uid]` |
