# Análise de Rotas — Bloco 4: Conversas

> Documento gerado com base nos screenshots capturados em `docs/screenshots/bloco-4/` e nos documentos de requisitos existentes.
> Viewport de captura: **390 × 844px** (mobile — iPhone 14 Pro)

---

## Visão Geral

O bloco 4 cobre o sistema de mensagens da plataforma. São 2 telas que compõem o canal de comunicação entre locatário e proprietário, construído sobre o Firebase Realtime Database.

| Rota | Nome | Descrição |
|------|------|-----------|
| `/private/conversations` | Conversas | Lista de todas as conversas do usuário |
| `/private/conversations/chat/[uid]` | Chat | Chat em tempo real com um usuário específico |

---

## Rotas Privadas — Conversas

### `/private/conversations`

<img src="./screenshots/bloco-4/conversations.png" alt="conversations" height="400" />

**Descrição**
Lista de todas as conversas do usuário logado, filtradas por modo ativo (lessor ou lessee) e por status (abertas ou fechadas).

**Funcionalidades visíveis**
- Toggle "Abertas / Fechadas" para filtrar conversas por status
- Card de cada conversa: avatar do usuário, nome, prévia da última mensagem e timestamp
- Badge de não lidas (quando aplicável)
- Navbar inferior com ícone de mensagens ativo

**Fluxo de saída**
- Clicar em conversa → `/private/conversations/chat/[uid]`

**Dependências de dados**
- Firebase Realtime Database: nó `users/:uid/chats/:appMode` — lista de conversas do usuário
- `GET /user/:targetUid` — dados do usuário destino (nome, avatar) para cada conversa

**Status de implementação:** ⚠️ Parcial

**Observações**
- Dados lidos diretamente do Firebase RTDB — sem endpoint REST dedicado para listar conversas
- Se o nó do Firebase for deletado ou o projeto trocado, toda a lista de conversas é perdida
- Sem badge de contador de mensagens não lidas implementado
- Sem busca ou filtro por nome de usuário

---

### `/private/conversations/chat/[uid]`

<img src="./screenshots/bloco-4/conversations-chat.png" alt="conversations-chat" height="400" />

**Descrição**
Chat em tempo real entre dois usuários. Histórico de mensagens carregado do Firebase e atualizado via listener em tempo real.

**Funcionalidades visíveis**
- Histórico de mensagens com bolhas diferenciadas por remetente
- Timestamp de cada mensagem
- Campo de texto para nova mensagem
- Botão de envio
- Scroll automático para a última mensagem
- Header com nome e avatar do usuário destino
- Botão para marcar conversa como aberta/fechada

**Fluxo de saída**
- Voltar → `/private/conversations`

**Dependências de dados**
- Firebase RTDB: nó `chats/:chatUid/messages` — histórico e listener em tempo real (`onValue`)
- Primeira mensagem: cria nó com `push()` e registra a conversa para ambos os lados (lessor/lessee)
- Cada mensagem: `{ content, senderUid, timestamp }`

**Status de implementação:** ⚠️ Parcial

**Observações**
- Histórico não é sincronizado com MongoDB — dependência total do Firebase RTDB
- Sem notificação push quando chega mensagem nova com o usuário offline
- Sem indicador de "digitando..."
- Sem suporte a envio de imagens ou arquivos
- Sem paginação do histórico — carrega todas as mensagens de uma vez

---

## Mapa de Fluxo — Bloco 4

```
[status-book/[uid] ou lessee/schedule/status-guest]
        │
  "Conversar com..."
        │
        ▼
  /private/conversations
        │
   clicar em conversa
        │
        ▼
  /private/conversations/chat/[uid]
        │
   enviar mensagem
        │
   Firebase RTDB ──► listener em tempo real ──► atualiza tela
```

---

## Resumo de Status por Rota

| Rota | Status | Lacunas principais |
|------|:------:|-------------------|
| `/private/conversations` | ⚠️ | Sem busca; sem badge de não lidas; dependência total do Firebase |
| `/private/conversations/chat/[uid]` | ⚠️ | Sem notificação offline; sem paginação; sem mídia |

---

## Funcionalidades Transversais do Bloco

| Funcionalidade | Status |
|----------------|:------:|
| Mensagens em tempo real (Firebase RTDB) | ✅ |
| Histórico persistido no Firebase | ✅ |
| Sincronização com MongoDB | ❌ |
| Notificação push de nova mensagem | ❌ |
| Indicador de digitando | ❌ |
| Envio de imagens/arquivos | ❌ |
| Paginação do histórico | ❌ |

---

## Navegação entre Blocos

| Bloco | Título | Entrada via |
|-------|--------|-------------|
| ← Bloco 3 | Fluxo de reserva | Botão "Conversar com o anfitrião" em `status-book/[uid]` |
| ← Bloco 6 | Gestão de reservas (lessee) | Botão "Conversar com hóspede" em `schedule/status-guest` |
