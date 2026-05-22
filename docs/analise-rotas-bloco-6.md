# Análise de Rotas — Bloco 6: Lessee — Gestão de Reservas

> Documento gerado com base nos screenshots capturados em `docs/screenshots/bloco-6/` e nos documentos de requisitos existentes.
> Viewport de captura: **390 × 844px** (mobile — iPhone 14 Pro)

---

## Visão Geral

O bloco 6 cobre as ferramentas de gestão do **proprietário (lessee)** após publicar um espaço: estatísticas, agenda, aprovação/negação de reservas e avaliação de hóspedes. São 9 telas organizadas em três sub-fluxos:

| Sub-fluxo | Rotas |
|-----------|-------|
| **Estatísticas** | `/private/lessee/info-place/[uid]` |
| **Agenda** | `/private/lessee/schedule`, `/private/lessee/schedule/status-guest` |
| **Aprovação de reservas** | `approve-booking/[uid]`, `approve/[uid]`, `approve/confirmed`, `approve/deny` |
| **Reservas concluídas** | `completed-booking/[uid]`, `completed-booking/approve/[uid]` |

---

## Sub-fluxo: Estatísticas

### `/private/lessee/info-place/[uid]`

<img src="./screenshots/bloco-6/lessee-info-place.png" alt="lessee-info-place" height="400" />

**Descrição**
Dashboard de métricas de um espaço específico. Exibe gráficos dos últimos 6 meses.

**Funcionalidades visíveis**
- Gráfico de barras: quantidade de reservas por mês
- Gráfico de linha: faturamento mensal (soma de `totalPrice`)
- Gráfico de barras: quantidade de hóspedes por mês
- Período: últimos 6 meses

**Dependências de dados**
- `GET /reports/quantity-of-bookings/:placeUid`
- `GET /reports/monthly-billing/:placeUid`
- `GET /reports/quantity-of-guest/:placeUid`
- Todas as chamadas feitas em paralelo

**Status de implementação:** ✅ Completo

**Observações**
- Faturamento reflete o `totalPrice` enviado pelo frontend — não o valor efetivamente cobrado (gateway não integrado)
- Sem taxa de ocupação, receita YTD ou ranking de horários mais reservados

---

## Sub-fluxo: Agenda

### `/private/lessee/schedule`

<img src="./screenshots/bloco-6/lessee-schedule.png" alt="lessee-schedule" height="400" />

**Descrição**
Calendário de reservas do espaço. Permite visualizar quais dias têm hóspedes e acessar os detalhes.

**Funcionalidades visíveis**
- Calendário mensal com dias marcados quando há reservas ativas
- Estatísticas do mês: total de reservas e dias disponíveis
- Clicar em data com reserva → lista de hóspedes do dia
- Navegação entre meses

**Dependências de dados**
- Consulta genérica de bookings do espaço — sem endpoint dedicado de agenda
- Agrupamento por dia feito no cliente

**Status de implementação:** ⚠️ Parcial

**Observações**
- Sem endpoint dedicado de agenda no backend — depende de consulta genérica de bookings
- Agrupamento server-side por dia ou semana não existe

---

### `/private/lessee/schedule/status-guest`

<img src="./screenshots/bloco-6/lessee-schedule-status-guest.png" alt="lessee-schedule-status-guest" height="400" />

**Descrição**
Detalhes de uma reserva do ponto de vista do proprietário no dia da estadia.

**Funcionalidades visíveis**
- Dados completos da reserva: espaço, datas, horários, hóspede
- Mapa de localização do espaço
- Botão "Conversar com hóspede" → `/private/conversations/chat/[uid]`
- Botão "Cancelar reserva"

**Fluxo de saída**
- "Conversar com hóspede" → `/private/conversations/chat/[uid]`
- "Cancelar reserva" → `PATCH /booking/:uid` com `bookingStatus: CANCELED`
- Voltar → `/private/lessee/schedule`

**Status de implementação:** ⚠️ Parcial

**Observações**
- Backend não possui campos de presença (check-in/check-out confirmados pelo proprietário)
- Status de presença do hóspede não é persistido

---

## Sub-fluxo: Aprovação de Reservas

### `/private/lessee/approve-booking/[uid]`

<img src="./screenshots/bloco-6/lessee-approve-booking.png" alt="lessee-approve-booking" height="400" />

**Descrição**
Lista de reservas pendentes de aprovação para um espaço específico.

**Funcionalidades visíveis**
- Cards de bookings com status `PENDING`
- Dados de cada booking: nome do locatário, datas, horários, hóspedes adicionais
- Clicar no booking → tela de decisão

**Dependências de dados**
- `GET /place?where[owner][uid]=:uid&where[booking][some][bookingStatus]=PENDING&include[booking][include][user]=true`

**Status de implementação:** ✅ Completo

---

### `/private/lessee/approve-booking/approve/[uid]`

<img src="./screenshots/bloco-6/lessee-approve-detail.png" alt="lessee-approve-detail" height="400" />

**Descrição**
Tela de decisão sobre uma reserva pendente. Proprietário pode confirmar ou negar.

**Funcionalidades visíveis**
- Dados completos da reserva: espaço, locatário, datas, horários
- Informações do hóspede: nome, foto, avaliações recebidas
- Botão "Confirmar reserva" → `PATCH /booking/:uid` com `bookingStatus: CONFIRMED`
- Botão "Negar reserva" → `/approve-booking/approve/deny?uid=`

**Fluxo de saída**
- Confirmar → `PATCH /booking/:uid` → `/approve-booking/approve/confirmed`
- Negar → `/approve-booking/approve/deny?uid=`

**Status de implementação:** ✅ Completo

---

### `/private/lessee/approve-booking/approve/confirmed`

<img src="./screenshots/bloco-6/lessee-approve-confirmed.png" alt="lessee-approve-confirmed" height="400" />

**Descrição**
Tela de feedback após confirmação bem-sucedida de uma reserva.

**Funcionalidades visíveis**
- Mensagem de sucesso
- Botão "Voltar às reservas" → `/approve-booking/[uid]`

**Status de implementação:** ✅ Completo

---

### `/private/lessee/approve-booking/approve/deny`

<img src="./screenshots/bloco-6/lessee-approve-deny.png" alt="lessee-approve-deny" height="400" />

**Descrição**
Fluxo de negação de reserva com campo de motivo e confirmação.

**Funcionalidades visíveis**
- Resumo da reserva a ser negada
- Campo de motivo (texto livre)
- Botão "Confirmar negação" → `PATCH /booking/:uid` com `bookingStatus: REJECTED`

**Fluxo de saída**
- Confirmar → `PATCH /booking/:uid` → `/approve-booking/[uid]`

**Status de implementação:** ✅ Completo

**Observações**
- Motivo da negação não é persistido no backend
- Sem notificação automática ao locatário após a negação

---

## Sub-fluxo: Reservas Concluídas

### `/private/lessee/completed-booking/[uid]`

<img src="./screenshots/bloco-6/lessee-completed-booking.png" alt="lessee-completed-booking" height="400" />

**Descrição**
Lista de reservas concluídas de um espaço específico.

**Funcionalidades visíveis**
- Cards de bookings com status `COMPLETED`
- Dados: locatário, período utilizado, valor total
- Clicar no booking → tela de avaliação do hóspede

**Dependências de dados**
- Mesma estrutura da lista de pendentes, filtrada por `bookingStatus: COMPLETED`

**Status de implementação:** ✅ Completo

---

### `/private/lessee/completed-booking/approve/[uid]`

<img src="./screenshots/bloco-6/lessee-completed-approve.png" alt="lessee-completed-approve" height="400" />

**Descrição**
Tela de avaliação do hóspede pelo proprietário após a conclusão da reserva.

**Funcionalidades visíveis**
- Dados do hóspede: nome, foto
- Seletor de estrelas (1 a 5)
- Campo de comentário
- Botão "Enviar avaliação" → `POST /rating`

**Dependências de dados**
- `POST /rating` com `ratingType: guest`, `targetUid`, `stars`, `comment`

**Status de implementação:** ✅ Completo

---

## Mapa de Fluxo — Bloco 6

```
[/private/lessee/my-place]
        │
   ┌────┴────────────────────────────────┐
   │                                     │
"Estatísticas"                    "Agenda"
   │                                     │
   ▼                                     ▼
info-place/[uid]               lessee/schedule
                                         │
                               clicar em data
                                         │
                               schedule/status-guest
                                         │
                               "Conversar com hóspede"
                                         │
                               conversations/chat/[uid]

[/private/lessee/my-place]
        │
   ┌────┴──────────────────┐
   │                       │
"Pendentes"           "Concluídas"
   │                       │
   ▼                       ▼
approve-booking/[uid]  completed-booking/[uid]
        │                       │
   clicar booking          clicar booking
        │                       │
approve/[uid]          completed-booking/approve/[uid]
        │                  POST /rating
   ┌────┴────┐
   │         │
confirmar   negar
   │         │
confirmed  deny
```

---

## Resumo de Status por Rota

| Rota | Status | Lacunas principais |
|------|:------:|-------------------|
| `/private/lessee/info-place/[uid]` | ✅ | Faturamento não reflete pagamento real |
| `/private/lessee/schedule` | ⚠️ | Sem endpoint dedicado; agrupamento no cliente |
| `/private/lessee/schedule/status-guest` | ⚠️ | Sem check-in/check-out confirmados pelo proprietário |
| `approve-booking/[uid]` | ✅ | — |
| `approve-booking/approve/[uid]` | ✅ | — |
| `approve-booking/approve/confirmed` | ✅ | — |
| `approve-booking/approve/deny` | ✅ | Motivo não persistido; sem notificação ao locatário |
| `completed-booking/[uid]` | ✅ | — |
| `completed-booking/approve/[uid]` | ✅ | — |

---

## Funcionalidades Transversais do Bloco

| Funcionalidade | Status |
|----------------|:------:|
| Gráficos de estatísticas (recharts) | ✅ |
| Aprovação/negação de reservas | ✅ |
| Avaliação de hóspede | ✅ |
| Agenda com calendário | ⚠️ (sem endpoint dedicado) |
| Confirmação de presença (check-in/check-out) | ❌ |
| Notificação ao locatário após decisão | ❌ |
| Persistência do motivo de negação | ❌ |

---

## Navegação entre Blocos

| Bloco | Título | Entrada via |
|-------|--------|-------------|
| ← Bloco 5 | Dashboard e cadastro de espaço | Links em `my-place` |
| ↔ Bloco 4 | Conversas | Botão "Conversar com hóspede" em `status-guest` |
