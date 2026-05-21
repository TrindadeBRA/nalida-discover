# Nalida — Análise de Paridade Backend × Frontend

> Documento produzido durante a fase **Discover** comercial. Objetivo: mapear o nível de maturidade de cada funcionalidade do produto, cruzando o que o frontend exibe com o que o backend realmente entrega.

---

## 1. Introdução

A Nalida é uma plataforma de aluguel de espaços comerciais sob demanda — análoga ao Airbnb para espaços de trabalho (salas de reunião, clínicas, estúdios, consultórios). O modelo de negócio conecta dois perfis:

- **Lessor** — quem aluga o espaço (cliente final)
- **Lessee** — quem disponibiliza o espaço (proprietário/gestor)

O projeto existe como monorepo desde **novembro de 2022**. O frontend web está em estágio mais avançado de UI/UX do que o backend está em lógica de negócio real — especialmente nas áreas de pagamento, notificações e relatórios avançados.

---

## 2. Resumo da Arquitetura

```
nalida-app-monorepo/
├── apps/
│   ├── nalida-api/      # Backend — NestJS 10 + Prisma + MongoDB
│   ├── nalida-web/      # Frontend Web — Next.js 14 (App Router)
│   └── nalida-app/      # App Mobile — React Native (Expo 50) + WebView wrapper
└── packages/
    ├── nalida-core-react/   # Design system compartilhado
    └── nalida-eslint-config/
```

### Camadas principais

| Camada | Tecnologia | Observação |
|---|---|---|
| API REST | NestJS 10 + Fastify | 9 módulos de negócio |
| ORM / Banco | Prisma 5 + MongoDB | Requer replica set local |
| Autenticação | Firebase Auth + JWT próprio | Duplo token: Firebase → JWT cookie |
| Storage de arquivos | Firebase Storage | Não emulado localmente |
| Mensagens em tempo real | Firebase Realtime Database | Usado pelo chat |
| Frontend Web | Next.js 14 App Router | Server + Client Components |
| Mobile | Expo 50 + WebView | Wrapper para a versão web |

---

## 3. Tecnologias e Versões

### Backend (nalida-api)

| Pacote | Versão |
|---|---|
| NestJS | 10.2.7 |
| Prisma | 5.9.1 |
| MongoDB (via Prisma) | provider nativo |
| firebase-admin | 11.9.0 |
| passport-jwt | 4.0.1 |
| passport-google-oauth20 | 2.0.0 |
| class-validator / class-transformer | 0.14 / 0.5.1 |
| date-fns | 2.30.0 |
| geolib | 3.3.4 |
| @nestjs/swagger | 7.1.13 |
| zod | 3.22.4 |
| uuid | 9.0.0 |
| slugify | 1.6.6 |

### Frontend Web (nalida-web)

| Pacote | Versão |
|---|---|
| Next.js | 14.2.35 |
| React | 18.2.0 |
| Firebase SDK | 12.2.1 |
| Axios | 1.6.5 |
| Styled Components | 6.1.8 |
| Framer Motion | 10.16.1 |
| TanStack Query | 5.17.10 |
| @react-google-maps/api | 2.19.2 |
| recharts | 2.9.3 |
| react-day-picker | 8.7.1 |
| swiper | 8.0.2 |
| react-webcam | 7.2.0 |
| date-fns | 2.30.0 |

### Mobile (nalida-app)

| Pacote | Versão |
|---|---|
| Expo | 50.0.7 |
| React Native | 0.73.4 |
| react-native-webview | 13.8.1 |
| expo-camera | 14.0.5 |
| expo-location | 16.5.3 |

---

## 4. Histórico de Commits

| Marco | Data |
|---|---|
| **Primeiro commit** | 12/11/2022 |
| **Último commit analisado** | 19/03/2026 |
| **Duração do projeto** | ~3 anos e 4 meses |

O projeto passou por ciclos de desenvolvimento intenso e períodos de pausa. O salto de `v0.4.0-alpha.21` (app) e `v0.4.0-alpha.36` (web/api) indica que nunca chegou a uma versão `1.0` estável.

---

## 5. Serviços de Terceiros e Custos Estimados

### Firebase (Google)

| Serviço | Uso no Produto | Custo (Free Tier / Estimativa) |
|---|---|---|
| **Firebase Auth** | Login social (Google), emissão de token | Gratuito até 10k usuários/mês |
| **Firebase Realtime Database** | Chat entre lessor e lessee | Gratuito até 1 GB armazenado, 10 GB/mês tráfego |
| **Firebase Storage** | Upload de imagens de espaços e documentos | Gratuito até 5 GB; após isso ~US$0,026/GB |
| **Firebase Hosting** *(não usado atualmente)* | — | — |

> Estimativa para escala inicial (até 5k usuários ativos): **dentro do plano Spark gratuito**, exceto Storage se tiver volume alto de imagens. O plano Blaze (pay-as-you-go) é recomendado a partir de 10k usuários.

### MongoDB Atlas (banco de dados em produção)

| Tier | Custo |
|---|---|
| M0 Free (atual — inferido pelo `.env` de prod) | Gratuito / limitado a 512 MB |
| M10 (recomendado para produção real) | ~US$57/mês |
| M20 | ~US$120/mês |

> O projeto usa o Atlas em produção. Replica set é obrigatório para Prisma+MongoDB.

### Brasil API (sem custo)

- **Endpoint `/bank`** — lista de bancos brasileiros
- **Endpoint `/uf`** — lista de estados
- **Endpoint `/cep/:cep`** — consulta de endereço por CEP

> Gratuito, sem autenticação. Risco de instabilidade em produção caso o serviço externo tenha downtime.

### Google Maps Platform

| API | Uso | Custo Estimado |
|---|---|---|
| Maps JavaScript API | Visualização de mapa de espaços (`/private/more`) | US$7 por 1.000 carregamentos |
| Geocoding API | Conversão endereço → coordenadas (implícito no form de cadastro) | US$5 por 1.000 requisições |

> A chave `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está referenciada no código. Para escala de 10k buscas/mês, estimar ~US$70–150/mês em Maps.

### Gateway de Pagamento *(não integrado — ver seção 6)*

O backend tem campos `acquirerOrderUid` e `acquirerName` no modelo `Booking`, e um endpoint `POST /booking/pay/confirmation/:acquirer` para webhook de confirmação. O método está **completamente comentado** — sem integração real com qualquer gateway (Stripe, PagarMe, Getnet, etc.).

| Opção sugerida | Custo operacional |
|---|---|
| PagarMe (Stone) | 3,99% no crédito, 1,99% no débito; sem mensalidade |
| Stripe | 3,99% + R$0,39 por transação aprovada |
| Asaas | 2,99% crédito; plano free com volume limitado |

---

## 6. Análise Detalhada: Frontend × Backend

### Legenda

| Símbolo | Significado |
|---|---|
| ✅ Completo | Frontend e backend implementados e funcionais |
| ⚠️ Parcial | Uma das camadas existe mas está incompleta ou não conectada |
| ❌ Faltando | Funcionalidade visível no frontend sem backend correspondente, ou vice-versa |

---

### 6.1 Autenticação e Sessão

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Login com Google (OAuth) | ✅ | ✅ | ✅ **Completo** | Firebase Auth → `POST /auth/login` emite JWT |
| Login com email/senha | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend tem tela `/manual-login`; backend só aceita token Firebase (sem endpoint `email+senha`) |
| Login com Apple | ❌ | ❌ | ❌ **Faltando** | Botão comentado no frontend; sem suporte no backend |
| Login com Facebook | ❌ | ❌ | ❌ **Faltando** | Botão comentado no frontend; sem suporte no backend |
| Cadastro por email | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend tem `/register/step-one` e `/step-two`; backend faz upsert via Firebase Auth na hora do login, sem endpoint de cadastro explícito |
| Logout | ✅ | ✅ | ✅ **Completo** | `POST /auth/logout` revoga token Firebase e limpa cookies |
| Refresh de token | ❌ | ⚠️ | ⚠️ **Parcial** | Backend tem `refreshToken` no model User, mas não há endpoint `/auth/refresh` implementado |
| Proteção de rotas (middleware) | ✅ | ✅ | ✅ **Completo** | `withAuth` no Next.js + Guards JWT no NestJS |
| Verificação de menor de idade | ✅ | ❌ | ⚠️ **Parcial** | Tela `/under-age` existe no frontend; nenhuma validação de data de nascimento no backend |

---

### 6.2 Onboarding

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Tela de boas-vindas + geolocalização | ✅ | ❌ | ⚠️ **Parcial** | Frontend captura lat/lng e salva em contexto; não persiste no backend |
| Aceitar termos de privacidade | ✅ | ❌ | ⚠️ **Parcial** | Frontend marca em contexto local; nenhum campo `acceptedTermsAt` no modelo User |
| Permissão de notificações push | ✅ | ❌ | ❌ **Faltando** | Tela `/notifications` existe; não há integração com FCM (Firebase Cloud Messaging) ou similar no backend |

---

### 6.3 Busca e Descoberta de Espaços (Lessor)

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Listagem por categoria com geolocalização | ✅ | ✅ | ✅ **Completo** | `GET /place/near` implementado com `geolib` + bounding box |
| Busca por texto | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend envia parâmetro de busca; backend aceita `where` genérico mas sem full-text search — apenas match exato |
| Filtros (preço, comodidades, distância) | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend tem UI de filtros em `/more`; backend aceita `where` via query params, mas não há lógica de range de preço pré-processada |
| Visualização em mapa | ✅ | ✅ | ✅ **Completo** | `geoLocation` no model Place; Google Maps no frontend |
| Detalhe do espaço | ✅ | ✅ | ✅ **Completo** | `GET /place/:uid` com includes de conveniences, spaceType, category |
| Paginação | ✅ | ✅ | ✅ **Completo** | `findPaginate` em todos os módulos com `page`/`size` |
| Avaliação média do espaço | ✅ | ✅ | ✅ **Completo** | `GET /rating/average/:uid` implementado |

---

### 6.4 Fluxo de Reserva (Lessor)

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Seleção de datas/horas | ✅ | ✅ | ✅ **Completo** | Frontend com `react-day-picker`; backend valida `checkIn`/`checkOut` e disponibilidade em `booking.service.ts` |
| Verificação de disponibilidade | ✅ | ✅ | ✅ **Completo** | `checkAvailability()` cruza `PlacesSchedule.availability` com bookings existentes |
| Cálculo de preço total | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend calcula e exibe o total; backend **não recalcula** — aceita `totalPrice` enviado pelo cliente (risco de manipulação) |
| Seleção de hóspedes adicionais | ✅ | ✅ | ✅ **Completo** | `details.additionalGuests` no model Booking |
| Criação da reserva | ✅ | ✅ | ✅ **Completo** | `POST /booking` com status inicial `PENDING` |
| Pagamento no ato da reserva | ✅ | ❌ | ❌ **Faltando** | Frontend exige método de pagamento; backend só armazena `paymentIuid` do perfil, sem cobrar nada — `payConfirmation()` está 100% comentado |
| Confirmação pós-reserva | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend mostra tela de sucesso; backend não envia nenhuma confirmação (email, push, etc.) |
| Cancelamento pelo locatário | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend tem tela `/status-book/cancel`; backend tem `PATCH /booking/:id` para atualizar status, mas sem lógica de política de cancelamento ou estorno |

---

### 6.5 Gestão de Reservas — Painel do Lessee (proprietário)

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Listar reservas pendentes | ✅ | ✅ | ✅ **Completo** | `GET /place?where[booking][some][bookingStatus]=PENDING` |
| Aprovar reserva | ✅ | ✅ | ✅ **Completo** | `PATCH /booking/:id` com `bookingStatus: APPROVED` |
| Negar reserva | ✅ | ✅ | ✅ **Completo** | `PATCH /booking/:id` com `bookingStatus: REJECTED` |
| Listar reservas concluídas | ✅ | ✅ | ✅ **Completo** | Filtro por `bookingStatus: COMPLETED` |
| Agenda do espaço | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend `/lessee/schedule` exibe calendário; backend não tem endpoint dedicado de agenda — depende de consulta genérica a bookings |
| Status do hóspede | ✅ | ⚠️ | ⚠️ **Parcial** | Tela `/schedule/status-guest` existe; lógica de status de presença não implementada no backend |

---

### 6.6 Cadastro de Espaço (Lessee — form-place)

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Info inicial (título, tipo, categoria, subcategoria) | ✅ | ✅ | ✅ **Completo** | `POST /place` + taxonomia `GET /category`, `GET /spaceType` |
| Endereço com busca por CEP | ✅ | ✅ | ✅ **Completo** | `GET /external/address/:cep` via Brasil API |
| Configurações (capacidade, banheiros, internet, m²) | ✅ | ✅ | ✅ **Completo** | `PlacesConfigurations` no model |
| Valores (hora, diária, taxa de limpeza, hóspede adicional) | ✅ | ✅ | ✅ **Completo** | `PlacesPricing` no model |
| Descontos por longa estadia | ✅ | ✅ | ✅ **Completo** | `PlacesPricingDiscountPolicy` no model |
| Disponibilidade / agenda de horários | ✅ | ✅ | ✅ **Completo** | `PlacesSchedule.availability` (JSON flexível) |
| Comodidades (conveniences) | ✅ | ✅ | ✅ **Completo** | `GET /conveniences` + relação many-to-many |
| Regras do espaço e check-in | ✅ | ✅ | ✅ **Completo** | `PlacesSpaceRules` no model |
| Upload de imagens | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend usa Firebase Storage via `useFirebaseStorage`; backend armazena apenas `{ path: string }` — sem validação de formato, tamanho ou quota |
| Política de cancelamento | ✅ | ✅ | ✅ **Completo** | `CancellationPolicy` como entidade separada com CRUD |
| Resultado / publicação do espaço | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend mostra tela de sucesso; backend não tem step de "publicar" — o espaço é criado já ativo, sem moderação |

---

### 6.7 Dashboard do Lessee (métricas)

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Quantidade de reservas por mês | ✅ | ✅ | ✅ **Completo** | `GET /reports/quantity-of-bookings/:placeUid` — últimos 6 meses |
| Faturamento mensal | ✅ | ✅ | ✅ **Completo** | `GET /reports/monthly-billing/:placeUid` — soma de `totalPrice` |
| Quantidade de hóspedes por mês | ✅ | ✅ | ✅ **Completo** | `GET /reports/quantity-of-guest/:placeUid` — conta `additionalGuests + 1` |
| Gráficos (recharts) | ✅ | ✅ | ✅ **Completo** | Frontend usa `recharts`; dados vêm dos endpoints acima |
| Métricas avançadas (receita YTD, taxa de ocupação, etc.) | ❌ | ❌ | ❌ **Faltando** | Nenhuma dessas métricas existe no frontend ou backend |

---

### 6.8 Chat / Mensagens

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Lista de conversas | ✅ | ❌ | ⚠️ **Parcial** | `/private/conversations` lista chats; dados vêm direto do Firebase Realtime DB (sem passar pela API) |
| Chat em tempo real | ✅ | ❌ | ⚠️ **Parcial** | `chat.view.tsx` implementado com Firebase Realtime Database (`ref`, `push`, `onValue`); a API NestJS não participa |
| Notificação de nova mensagem | ❌ | ❌ | ❌ **Faltando** | Sem push notification, sem badge, sem email |
| Histórico de mensagens persistido | ✅ | ❌ | ⚠️ **Parcial** | Persistido no Firebase RTDB; não sincronizado com MongoDB |

---

### 6.9 Perfil do Usuário

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Visualizar perfil | ✅ | ✅ | ✅ **Completo** | `GET /user/:uid` |
| Editar nome | ✅ | ✅ | ✅ **Completo** | `PATCH /user/:id` |
| Editar data de nascimento | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend tem `/profile/birthday`; o model `Profile` não tem campo `birthDay` no Prisma schema (existe como `type` mas sem migration válida para MongoDB) |
| Adicionar endereço | ✅ | ✅ | ✅ **Completo** | Array `addresses` no model User |
| Adicionar método de pagamento (cartão) | ✅ | ✅ | ✅ **Completo** | `POST /user/payment/:userUid` — encrypta CVV e número com `CryptoSystemProvider` |
| Remover método de pagamento | ✅ | ✅ | ✅ **Completo** | `DELETE /user/payment/:userUid/:iuid` |
| Conta bancária para recebimento (lessee) | ✅ | ⚠️ | ⚠️ **Parcial** | Frontend `/profile/receiver-method`; backend tem `receiverMethods: Json?` no model mas sem endpoint de validação bancária real |
| Verificação de documentos (RG/CPF + selfie) | ✅ | ❌ | ❌ **Faltando** | Frontend tem fluxo completo com câmera (`react-webcam`) + upload; nenhuma verificação de identidade no backend (sem integração com Serpro, Idwall, etc.) |
| Visualizar perfil de outro usuário | ✅ | ✅ | ✅ **Completo** | `GET /user/:uid` + rota `/profile/guest-profile/:uid` |
| Avaliação de usuário (owner/renter) | ⚠️ | ✅ | ⚠️ **Parcial** | Backend tem `Rating` com `ratingType: owner\|renter\|place`; frontend não tem tela de avaliar usuário pós-reserva |

---

### 6.10 Avaliações de Espaços

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Exibir avaliação média | ✅ | ✅ | ✅ **Completo** | `GET /rating/average/:uid` + `rating.stars` no model Place |
| Criar avaliação | ❌ | ✅ | ⚠️ **Parcial** | `POST /rating` implementado; nenhuma tela de submissão de avaliação no frontend |
| Listar avaliações do espaço | ❌ | ✅ | ⚠️ **Parcial** | `GET /rating` com filtro; nenhuma listagem de reviews no detalhe do espaço |

---

### 6.11 Notificações

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Solicitar permissão push | ✅ | ❌ | ❌ **Faltando** | Tela UI existe; sem integração com FCM |
| Notificação de reserva aprovada | ❌ | ❌ | ❌ **Faltando** | Sem implementação em nenhuma camada |
| Notificação de nova reserva (lessee) | ❌ | ❌ | ❌ **Faltando** | — |
| Notificação de mensagem no chat | ❌ | ❌ | ❌ **Faltando** | — |
| Email transacional | ❌ | ❌ | ❌ **Faltando** | Sem integração com Resend, SendGrid, AWS SES, etc. |

---

### 6.12 Pagamento (crítico)

| Funcionalidade | Frontend | Backend | Status | Observação |
|---|---|---|---|---|
| Cadastrar cartão de crédito | ✅ | ✅ | ✅ **Completo** | Encrypta dados sensíveis no backend; armazena no perfil do usuário |
| Selecionar forma de pagamento na reserva | ✅ | ✅ | ✅ **Completo** | `paymentIuid` linkado ao booking |
| **Processar cobrança** | ❌ | ❌ | ❌ **Faltando** | **Maior gap do produto.** O método `payConfirmation()` está 100% comentado. Nenhum gateway integrado. |
| Webhook de confirmação de pagamento | ❌ | ❌ | ❌ **Faltando** | Endpoint `POST /booking/pay/confirmation/:acquirer` existe mas sem lógica |
| Repasse ao proprietário (split) | ❌ | ❌ | ❌ **Faltando** | `receiverMethods` no perfil não tem uso real |
| Reembolso / estorno | ❌ | ❌ | ❌ **Faltando** | Sem lógica de estorno em cancelamentos |
| Histórico de pagamentos | ❌ | ❌ | ❌ **Faltando** | Sem endpoint de extrato financeiro |

---

### 6.13 App Mobile (nalida-app)

| Funcionalidade | Status | Observação |
|---|---|---|
| Tela própria nativa | ❌ | O app é apenas um **wrapper WebView** que carrega a URL da nalida-web |
| Camera nativa (expo-camera) | ⚠️ | Dependência presente; usada pontualmente |
| Geolocalização nativa (expo-location) | ⚠️ | Dependência presente; integração com WebView não verificada |
| Build OTA (expo-updates) | ✅ | Configurado via EAS |
| Tela de splash / onboarding nativo | ❌ | Sem implementação nativa própria |

---

## 7. Resumo Executivo

### Contagem por status

| Status | Quantidade |
|---|---|
| ✅ Completo | ~28 funcionalidades |
| ⚠️ Parcial | ~22 funcionalidades |
| ❌ Faltando | ~18 funcionalidades |

### Pontos fortes

1. **CRUD de espaços** completo: o fluxo de cadastro de ambiente (form-place) está bem implementado em ambas as camadas, com validações e relações de taxonomia.
2. **Reservas com verificação de disponibilidade**: a lógica de `checkAvailability` no backend é funcional.
3. **Chat em tempo real**: funciona via Firebase RTDB sem depender de infraestrutura de WebSocket própria.
4. **Relatórios básicos do lessee**: os 3 endpoints de reports existem e entregam dados reais.
5. **Busca geolocalizadas**: `GET /place/near` com bounding box está implementado.

### Riscos críticos

1. **Pagamento não existe**: o produto não consegue cobrar nenhum cliente. Toda a UI de pagamento é cosmética. Essa é a maior lacuna para um lançamento comercial.
2. **Sem notificações**: o proprietário não recebe aviso de nova reserva. A experiência pós-booking está quebrada.
3. **Preço calculado pelo cliente**: `totalPrice` vem do frontend sem recálculo no backend — vulnerabilidade grave de manipulação de valor.
4. **Upload de imagens sem controle**: qualquer URL pode ser salva; sem validação de tamanho, tipo MIME ou moderação.
5. **App mobile é apenas WebView**: zero diferencial nativo; não justifica publicação em loja como app dedicado no estágio atual.
6. **Sem email transacional**: confirmações de reserva, boas-vindas e recuperação de senha dependem exclusivamente do Firebase.

### Roadmap recomendado por prioridade

| Prioridade | Item | Esforço estimado |
|---|---|---|
| 🔴 P0 | Integrar gateway de pagamento (PagarMe ou Stripe) | 3–4 semanas |
| 🔴 P0 | Recalcular `totalPrice` no backend (anti-fraude) | 2 dias |
| 🔴 P0 | Notificações push via FCM (aprovação de reserva, mensagem) | 1–2 semanas |
| 🟠 P1 | Email transacional (Resend ou SendGrid) — confirmação de reserva, cadastro | 1 semana |
| 🟠 P1 | Endpoint `/auth/refresh` para renovar JWT sem logout | 3 dias |
| 🟠 P1 | Validação de documentos (integração KYC mínima) | 2–3 semanas |
| 🟡 P2 | Tela de avaliação pós-reserva (frontend) | 3 dias |
| 🟡 P2 | Moderação de espaços antes da publicação | 1 semana |
| 🟡 P2 | Full-text search no `GET /place` | 2–3 dias |
| 🟢 P3 | App mobile nativo com telas próprias | 4–8 semanas |
| 🟢 P3 | Métricas avançadas no dashboard do lessee | 1–2 semanas |
