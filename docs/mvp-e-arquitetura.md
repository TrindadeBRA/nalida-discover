# MVP & Arquitetura Proposta — Nalida
## Fase Discover · TrinityWeb · Maio 2026

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                     INFRAESTRUTURA                  │
│                                                     │
│  ┌─────────────────┐   ┌──────────────────────────┐ │
│  │  nalida-api      │   │  Serviços externos       │ │
│  │  Node + Express  │   │  ├─ Firebase Auth        │ │
│  │  Prisma + Mongo  │◄──┤  ├─ Firebase Storage     │ │
│  │  REST API        │   │  ├─ Firebase RTDB (chat) │ │
│  └────────┬─────────┘   │  └─ Gateway pagamento    │ │
│           │             └──────────────────────────┘ │
│    ┌──────┴────────────────────┐                     │
│    │                           │                     │
│  ┌─┴──────────────┐  ┌─────────┴──────────────────┐  │
│  │  nalida-admin   │  │  nalida-web                │  │
│  │  React          │  │  Next.js 14 (App Router)   │  │
│  │  Backoffice     │  │  Portal cliente + host     │  │
│  └────────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

| Camada | Stack | Responsabilidade |
|---|---|---|
| **API** | Node.js · Express · Prisma · MongoDB | Regras de negócio, autenticação, dados |
| **nalida-web** | Next.js 14 · React | Portal público — clientes e hosts |
| **nalida-admin** | React (Vite/CRA) · TanStack Query | Backoffice interno da equipe Nalida |

**Modelo de perfil unificado**
Todos os usuários nascem como **cliente** (quem aluga). Ao cadastrar o primeiro imóvel, tornam-se **host** (quem disponibiliza). Não há papéis fixos — o mesmo usuário pode ser cliente e host simultaneamente.

---

## Funcionalidades — MVP vs Completo

> **MVP** = o mínimo para que o produto opere comercialmente: usuário cria conta, encontra um espaço, faz e paga uma reserva, proprietário recebe.
> **Completo** = todas as funcionalidades previstas no produto final.

**Legenda de fase**

| Símbolo | Fase |
|---|---|
| 🟢 **MVP** | Obrigatório para lançamento |
| 🔵 **V2** | Próxima iteração pós-lançamento |
| ⚫ **V3** | Futuro / nice-to-have |

---

### 1. Autenticação

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 1.1 | Login com Google | 🟢 MVP | web |
| 1.2 | Login com e-mail e senha | 🟢 MVP | web |
| 1.3 | Cadastro com e-mail e senha | 🟢 MVP | web |
| 1.4 | Logout | 🟢 MVP | web |
| 1.5 | Renovação automática de token (refresh) | 🟢 MVP | api |
| 1.6 | Login com Apple | ⚫ V3 | web |
| 1.7 | Login com Facebook | ⚫ V3 | web |
| 1.8 | Bloqueio de menores de 18 anos | 🔵 V2 | web + api |

---

### 2. Onboarding

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 2.1 | Captura de geolocalização | 🟢 MVP | web |
| 2.2 | Aceite de termos de uso (registrado no backend) | 🟢 MVP | web + api |
| 2.3 | Notificações push — solicitação de permissão | 🔵 V2 | web + api |

---

### 3. Busca e Descoberta

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 3.1 | Listagem de espaços por categoria e proximidade | 🟢 MVP | web |
| 3.2 | Busca por texto (full-text search) | 🟢 MVP | api |
| 3.3 | Filtros: preço, comodidades, distância | 🔵 V2 | web + api |
| 3.4 | Visualização em mapa (Google Maps) | 🔵 V2 | web |
| 3.5 | Detalhe completo do espaço | 🟢 MVP | web |
| 3.6 | Paginação de resultados | 🟢 MVP | api |
| 3.7 | Nota média do espaço | 🔵 V2 | web + api |

---

### 4. Reservas — Cliente

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 4.1 | Selecionar datas | 🟢 MVP | web |
| 4.2 | Selecionar horário (reserva por hora) | 🟢 MVP | web |
| 4.3 | Selecionar hóspedes adicionais | 🟢 MVP | web |
| 4.4 | Verificação de disponibilidade | 🟢 MVP | api |
| 4.5 | Cálculo do valor total no backend | 🟢 MVP | api |
| 4.6 | Confirmar e criar reserva | 🟢 MVP | web + api |
| 4.7 | Processar pagamento (gateway) | 🟢 MVP | api |
| 4.8 | Acompanhamento do status da reserva | 🟢 MVP | web |
| 4.9 | Cancelamento de reserva | 🔵 V2 | web + api |
| 4.10 | Reembolso por cancelamento | 🔵 V2 | api |

---

### 5. Histórico de Reservas — Cliente

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 5.1 | Lista de reservas (ativas, inativas, anteriores) | 🟢 MVP | web |
| 5.2 | Avaliar espaço após reserva concluída | 🔵 V2 | web |

---

### 6. Cadastro de Espaço — Host

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 6.1 | Informações gerais (título, tipo, categoria) | 🟢 MVP | web |
| 6.2 | Endereço com consulta por CEP | 🟢 MVP | web |
| 6.3 | Configurações físicas (capacidade, tamanho, etc.) | 🟢 MVP | web |
| 6.4 | Valores e preços | 🟢 MVP | web |
| 6.5 | Desconto para estadias longas | 🔵 V2 | web |
| 6.6 | Disponibilidade e horários | 🟢 MVP | web |
| 6.7 | Comodidades | 🟢 MVP | web |
| 6.8 | Regras e instrução de check-in | 🟢 MVP | web |
| 6.9 | Upload de fotos | 🟢 MVP | web + api |
| 6.10 | Política de cancelamento | 🟢 MVP | web |
| 6.11 | Publicação com moderação prévia | 🔵 V2 | admin + api |

---

### 7. Painel do Host

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 7.1 | Lista de espaços cadastrados | 🟢 MVP | web |
| 7.2 | Reservas pendentes de aprovação | 🟢 MVP | web |
| 7.3 | Aprovar reserva | 🟢 MVP | web + api |
| 7.4 | Negar reserva | 🟢 MVP | web + api |
| 7.5 | Reservas concluídas | 🟢 MVP | web |
| 7.6 | Agenda visual do espaço | 🔵 V2 | web + api |
| 7.7 | Gráfico: reservas por mês | 🔵 V2 | web |
| 7.8 | Gráfico: faturamento mensal | 🔵 V2 | web |
| 7.9 | Gráfico: hóspedes por mês | 🔵 V2 | web |
| 7.10 | Métricas avançadas (ocupação, YTD) | ⚫ V3 | web + api |

---

### 8. Chat

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 8.1 | Envio e recebimento de mensagens em tempo real | 🟢 MVP | web |
| 8.2 | Lista de conversas | 🟢 MVP | web |
| 8.3 | Notificação de nova mensagem | 🔵 V2 | web + api |

---

### 9. Perfil do Usuário

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 9.1 | Visualizar e editar nome | 🟢 MVP | web |
| 9.2 | Editar data de nascimento | 🟢 MVP | web |
| 9.3 | Gerenciar endereços | 🟢 MVP | web |
| 9.4 | Adicionar / remover cartão de crédito | 🟢 MVP | web |
| 9.5 | Cadastrar conta bancária para recebimento | 🟢 MVP | web + api |
| 9.6 | Verificação de identidade (KYC) | 🔵 V2 | web + api |
| 9.7 | Visualizar perfil público de outro usuário | 🔵 V2 | web |
| 9.8 | Alternância cliente ↔ host | 🟢 MVP | web |

---

### 10. Avaliações

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 10.1 | Nota média do espaço | 🔵 V2 | web |
| 10.2 | Submeter avaliação do espaço | 🔵 V2 | web + api |
| 10.3 | Listar avaliações na página do espaço | 🔵 V2 | web |
| 10.4 | Avaliar host após estadia | ⚫ V3 | web + api |
| 10.5 | Avaliar cliente após estadia | ⚫ V3 | web + api |

---

### 11. Notificações

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 11.1 | E-mail: confirmação de reserva | 🟢 MVP | api |
| 11.2 | E-mail: nova reserva pendente (host) | 🟢 MVP | api |
| 11.3 | E-mail: boas-vindas pós-cadastro | 🟢 MVP | api |
| 11.4 | Push: reserva aprovada | 🔵 V2 | api |
| 11.5 | Push: nova reserva pendente | 🔵 V2 | api |
| 11.6 | Push: nova mensagem no chat | 🔵 V2 | api |
| 11.7 | E-mail: lembrete 24h antes do check-in | 🔵 V2 | api |

---

### 12. Pagamento

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 12.1 | Cadastrar cartão | 🟢 MVP | web + api |
| 12.2 | Processar cobrança no ato da reserva | 🟢 MVP | api |
| 12.3 | Webhook de confirmação do gateway | 🟢 MVP | api |
| 12.4 | Repasse ao host (split de pagamento) | 🟢 MVP | api |
| 12.5 | Reembolso em cancelamentos | 🔵 V2 | api |
| 12.6 | Histórico de transações | 🔵 V2 | web + api |

---

### 13. Backoffice Administrativo

| # | Funcionalidade | Fase | App |
|---|---|:---:|---|
| 13.1 | Login da equipe interna | 🟢 MVP | admin |
| 13.2 | Listagem e busca de usuários | 🟢 MVP | admin |
| 13.3 | Listagem e busca de espaços | 🟢 MVP | admin |
| 13.4 | Aprovar / rejeitar publicação de espaço | 🔵 V2 | admin |
| 13.5 | Listagem de reservas e status de pagamento | 🟢 MVP | admin |
| 13.6 | Gerenciar categorias, tipos de espaço, comodidades | 🟢 MVP | admin |
| 13.7 | Gerenciar políticas de cancelamento | 🟢 MVP | admin |
| 13.8 | Dashboard com métricas da plataforma | 🔵 V2 | admin |
| 13.9 | Gerenciar usuários reportados / suspender contas | 🔵 V2 | admin |

---

## Resumo por fase

| Fase | Funcionalidades | Foco |
|---|:---:|---|
| 🟢 **MVP** | 38 | Criar conta → encontrar espaço → reservar → pagar → host recebe |
| 🔵 **V2** | 28 | Avaliações, notificações push, filtros, métricas, moderação |
| ⚫ **V3** | 7 | Avaliação entre usuários, login Apple/Facebook, métricas avançadas |

---

## O que a API atual já entrega para o MVP

| Módulo | Status |
|---|---|
| Autenticação (Firebase + JWT) | ✅ Funcional |
| CRUD de usuários + pagamento | ✅ Funcional |
| CRUD de espaços + busca geolocalizada | ✅ Funcional |
| Verificação de disponibilidade | ✅ Funcional |
| Criação e atualização de reservas | ✅ Funcional |
| Relatórios básicos | ✅ Funcional |
| Taxonomia (categorias, tipos, comodidades) | ✅ Funcional |
| **Cálculo de preço no backend** | ❌ Faltando |
| **Gateway de pagamento** | ❌ Faltando |
| **Renovação de token (refresh)** | ❌ Faltando |
| **E-mails transacionais** | ❌ Faltando |
| **Aceite de termos persistido** | ❌ Faltando |

---

*TrinityWeb · Fase Discover · Maio 2026*
