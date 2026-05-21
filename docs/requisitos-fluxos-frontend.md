# Documento de Requisitos — Fluxos Funcionais
## Nalida · Base: Frontend Existente · Maio 2026

---

> **Objetivo deste documento**
> Registrar os fluxos funcionais existentes no frontend como base de requisitos do produto. Cada fluxo descreve o caminho que o usuário percorre, as telas envolvidas, as entradas e saídas esperadas. O status indica a paridade atual com o backend.
>
> | | Descrição |
> |---|---|
> | ✅ **Completo** | Implementado e funcional nas duas camadas |
> | ⚠️ **Parcial** | Existe em uma camada, mas incompleto ou desconectado na outra |
> | ❌ **Ausente** | Funcionalidade esperada sem implementação real em nenhuma das camadas |

---

## Bloco 1 — Autenticação e Acesso

---

### 1.1 — Login com Google ✅

**Descrição**
Autenticação via conta Google. É o método principal e recomendado da plataforma.

**Telas envolvidas**
`/login` → `/welcome`

**Fluxo**
1. Usuário acessa `/login` e visualiza o botão "Entrar com Google"
2. Clica no botão → popup do Google OAuth é aberto
3. Usuário seleciona ou confirma a conta Google
4. Firebase Auth emite um `idToken`
5. Frontend chama `POST /api/internal/auth/login` com o `idToken`
6. API verifica o token no Firebase Admin SDK, faz upsert do usuário no MongoDB e retorna `accessToken` + `refreshToken` como cookies `httpOnly`
7. Frontend redireciona para `/welcome`

**Entradas:** conta Google válida
**Saídas:** cookies `accessToken` e `refreshToken`; usuário criado/atualizado no banco

---

### 1.2 — Login com e-mail e senha ⚠️

**Descrição**
Autenticação manual via e-mail e senha cadastrados no Firebase Auth.

**Telas envolvidas**
`/login` → `/manual-login` → `/welcome`

**Fluxo**
1. Usuário acessa `/login` e clica em "Entrar com e-mail"
2. Redirecionado para `/manual-login` com formulário de e-mail e senha
3. Submete o formulário → Firebase Auth autentica via `signInWithEmailAndPassword`
4. Firebase retorna `idToken`
5. Frontend chama `POST /auth/login` com o token
6. Fluxo segue igual ao item 1.1 a partir do passo 6

**Entradas:** e-mail e senha
**Saídas:** mesmas do item 1.1
**Lacuna:** o backend não possui endpoint de cadastro por e-mail/senha. O usuário precisa ter sido criado anteriormente via Firebase Console ou pelo fluxo 1.5.

---

### 1.3 — Login com Apple ❌

**Descrição**
Autenticação via conta Apple ID. Botão visível mas desativado.

**Telas envolvidas**
`/login`

**Fluxo esperado**
1. Usuário clica em "Entrar com Apple"
2. Popup do Sign in with Apple é aberto
3. Usuário autentica → fluxo segue igual ao 1.1

**Estado atual:** botão comentado no código. Sem implementação no frontend ou no backend.

---

### 1.4 — Login com Facebook ❌

**Descrição**
Autenticação via conta Facebook. Botão visível mas desativado.

**Telas envolvidas**
`/login`

**Estado atual:** botão comentado no código. Sem implementação em nenhuma camada.

---

### 1.5 — Cadastro de novo usuário ⚠️

**Descrição**
Criação de conta por e-mail e senha, com preenchimento de dados pessoais em duas etapas.

**Telas envolvidas**
`/register` → `/register/step-one` → `/register/step-two` → `/welcome`

**Fluxo**
1. Usuário acessa `/register` → redirecionado para `/register/step-one`
2. Step 1: preenche e-mail e senha → Firebase cria o usuário com `createUserWithEmailAndPassword`
3. Avança para `/register/step-two`
4. Step 2: preenche nome e data de nascimento
5. Frontend chama `POST /auth/login` com o token do usuário recém-criado
6. API faz upsert com os dados do Firebase (sem nome e data de nascimento — não enviados neste step)
7. Redirecionado para `/welcome`

**Entradas:** e-mail, senha, nome, data de nascimento
**Saídas:** usuário criado no Firebase Auth; upsert no MongoDB
**Lacuna:** nome e data de nascimento preenchidos no step 2 não são persistidos no backend. O upsert usa apenas os dados do Firebase (`displayName`, `email`).

---

### 1.6 — Logout e encerramento de sessão ✅

**Descrição**
Encerra a sessão do usuário tanto no Firebase quanto no backend.

**Telas envolvidas**
Menu de perfil (sidebar) → `/login`

**Fluxo**
1. Usuário clica em "Sair" na sidebar
2. Frontend chama `POST /auth/logout` com o `accessToken`
3. API verifica o session cookie no Firebase Admin e revoga os refresh tokens
4. Frontend limpa cookies e redireciona para `/login`

**Entradas:** `accessToken` válido
**Saídas:** sessão encerrada, cookies removidos, usuário deslogado do Firebase

---

### 1.7 — Renovação automática de token (refresh) ⚠️

**Descrição**
Renovação silenciosa da sessão quando o `accessToken` expira, sem forçar novo login.

**Fluxo esperado**
1. Requisição retorna 401 (token expirado)
2. Frontend usa o `refreshToken` para obter um novo `accessToken`
3. Requisição original é repetida de forma transparente

**Estado atual:** campo `refreshToken` existe no banco. Não há endpoint `/auth/refresh` implementado. Quando o token expira, o usuário é deslogado.

---

### 1.8 — Bloqueio de acesso para menores de 18 anos ⚠️

**Descrição**
Impede que usuários com menos de 18 anos prossigam no cadastro.

**Telas envolvidas**
`/register/step-two` → `/under-age`

**Fluxo**
1. No step 2 do cadastro, usuário informa data de nascimento
2. Frontend calcula a idade
3. Se menor de 18 anos → redirecionado para `/under-age`
4. Tela exibe mensagem de bloqueio, sem caminho de retorno

**Entradas:** data de nascimento
**Saídas:** bloqueio de acesso à plataforma
**Lacuna:** validação ocorre apenas no frontend. O backend não armazena a data de nascimento nem bloqueia a conta por idade.

---

## Bloco 2 — Onboarding

---

### 2.1 — Captura de geolocalização inicial ⚠️

**Descrição**
Solicita permissão de localização ao usuário logo após o primeiro acesso, para personalizar os resultados de busca.

**Telas envolvidas**
`/welcome`

**Fluxo**
1. Após login, usuário é direcionado para `/welcome`
2. Tela exibe botão "Permitir localização"
3. Navegador solicita permissão de geolocalização
4. Coordenadas são salvas no contexto global (`LocationProvider`)
5. Botão "Avançar" redireciona para o dashboard conforme o modo ativo (lessor ou lessee)

**Entradas:** permissão de geolocalização do navegador
**Saídas:** `lat`/`lng` disponíveis em memória para a sessão
**Lacuna:** localização não é persistida no perfil do usuário no backend.

---

### 2.2 — Aceite dos termos de privacidade ⚠️

**Descrição**
Apresenta os termos de privacidade e registra a concordância do usuário.

**Telas envolvidas**
`/privacy`

**Fluxo**
1. Usuário acessa `/privacy` (pode ser redirecionado no onboarding)
2. Lê os termos exibidos na tela
3. Clica em "Aceitar"
4. Contexto global marca `privacyAccepted: true`

**Entradas:** ação do usuário (botão "Aceitar")
**Saídas:** flag em memória
**Lacuna:** nenhum campo `acceptedTermsAt` no banco de dados. O aceite não é registrado de forma auditável.

---

### 2.3 — Solicitação de permissão para notificações ❌

**Descrição**
Solicita autorização do navegador para envio de notificações push.

**Telas envolvidas**
`/notifications`

**Fluxo esperado**
1. Tela exibe botão "Autorizar notificações"
2. Navegador exibe prompt nativo de permissão
3. Token FCM é obtido e enviado ao backend para registro

**Estado atual:** tela construída e botão visível. Não há integração com Firebase Cloud Messaging nem endpoint no backend para registrar o token do dispositivo. Clicar em "Autorizar" não produz efeito.

---

## Bloco 3 — Busca e Descoberta de Espaços

---

### 3.1 — Listagem de espaços por categoria e proximidade ✅

**Descrição**
Dashboard principal do modo lessor. Exibe espaços agrupados por categoria, priorizando os mais próximos ao usuário.

**Telas envolvidas**
`/private`

**Fluxo**
1. Usuário acessa `/private`
2. Frontend obtém `lat`/`lng` do `LocationProvider`
3. Para cada categoria, chama `GET /place/near?lat=&lng=&maxDistance=10000&include[category]=true&include[spaceType]=true`
4. Exibe cards de espaços agrupados por categoria (máx. 5 por grupo)
5. Cada card é clicável e leva para o detalhe do espaço (3.5)

**Entradas:** coordenadas do usuário
**Saídas:** lista de espaços próximos agrupados por categoria

---

### 3.2 — Busca por texto ⚠️

**Descrição**
Campo de busca no dashboard que filtra espaços por cidade ou bairro.

**Telas envolvidas**
`/private` → `/private/more`

**Fluxo**
1. Usuário digita no campo de busca no topo do dashboard
2. Frontend envia parâmetro de texto para `GET /place?where[address][city]=valor`
3. Resultados são exibidos em `/private/more`

**Entradas:** texto livre
**Saídas:** lista de espaços filtrados
**Lacuna:** o backend não implementa full-text search. A busca funciona apenas como correspondência exata de campo — termos parciais ou compostos podem não retornar resultados esperados.

---

### 3.3 — Filtros de preço, comodidades e distância ⚠️

**Descrição**
Painel de filtros avançados na tela de listagem completa.

**Telas envolvidas**
`/private/more`

**Fluxo**
1. Usuário acessa a listagem completa de uma categoria
2. Abre o painel de filtros
3. Define faixa de preço (slider), comodidades desejadas e distância máxima
4. Frontend aplica filtros e recarrega resultados

**Entradas:** faixa de preço, lista de comodidades, distância em km
**Saídas:** lista de espaços filtrada
**Lacuna:** filtro de faixa de preço e distância máxima são processados no cliente. O backend não possui parâmetros dedicados para range de preço — aceita `where` genérico, mas sem operadores `gte`/`lte` pré-processados.

---

### 3.4 — Visualização em mapa com marcadores ✅

**Descrição**
Alterna a listagem de espaços para exibição em mapa interativo com marcadores clicáveis.

**Telas envolvidas**
`/private/more` (toggle lista/mapa)

**Fluxo**
1. Usuário clica no botão de alternância "Mapa"
2. Frontend renderiza Google Maps com os espaços da listagem atual
3. Cada espaço aparece como um marcador no mapa
4. Clicar no marcador exibe um card resumido do espaço
5. Clicar no card navega para o detalhe (3.5)

**Entradas:** lista de espaços com `geoLocation.lat` e `geoLocation.lng`
**Saídas:** mapa interativo com marcadores

---

### 3.5 — Detalhe completo do espaço ✅

**Descrição**
Tela com todas as informações de um espaço antes de iniciar a reserva.

**Telas envolvidas**
`/private/place?uid=`

**Fluxo**
1. Usuário clica em um espaço (card ou marcador)
2. Frontend chama `GET /place/:uid?include[conveniences]=true&include[spaceType]=true&include[category]=true`
3. Exibe: galeria de fotos, título, tipo de espaço, categoria, endereço
4. Exibe: capacidade, banheiros, velocidade de internet, m²
5. Exibe: preço por hora, diária, hóspede adicional, taxa de limpeza
6. Exibe: comodidades, regras, política de cancelamento, instruções de check-in
7. Exibe: mapa com localização e avaliação média
8. Botão "Reservar" inicia o fluxo 4.1

**Entradas:** `uid` do espaço
**Saídas:** tela completa de detalhes

---

### 3.6 — Paginação de resultados ✅

**Descrição**
Carregamento paginado de espaços nas listagens.

**Fluxo**
1. Frontend envia `page=1&size=10` nas requisições de listagem
2. Backend retorna `{ items, page, size, totalNumberOfItems, totalNumberOfPages }`
3. Frontend exibe botão "Ver mais" ou paginação ao chegar ao final da lista

---

### 3.7 — Avaliação média do espaço ✅

**Descrição**
Exibe a nota média do espaço calculada a partir das avaliações recebidas.

**Fluxo**
1. Na tela de detalhe do espaço, frontend chama `GET /rating/average/:uid`
2. Backend calcula a média de todos os ratings do espaço
3. Nota é exibida junto ao nome do espaço (estrelas + número de avaliações)

---

## Bloco 4 — Fluxo de Reserva (perspectiva do locatário)

---

### 4.1 — Seleção de datas e horários ✅

**Descrição**
Primeira etapa da reserva: escolha das datas e, opcionalmente, do horário de entrada e saída.

**Telas envolvidas**
`/private/booking/calendar?uid=`

**Fluxo**
1. A partir do detalhe do espaço, usuário clica em "Reservar"
2. Frontend carrega o calendário com as datas disponíveis (baseado em `PlacesSchedule.availability`)
3. Usuário seleciona as datas desejadas (pode selecionar múltiplos dias)
4. Se o espaço permite reserva por hora (`allowsBookPerHour`): avança para `/booking/hours`
5. Caso contrário: avança diretamente para `/booking/guests`

**Entradas:** seleção de datas no calendário
**Saídas:** datas salvas no `BookingProvider` (contexto de reserva)

---

### 4.2 — Verificação de disponibilidade em tempo real ✅

**Descrição**
Impede que o usuário selecione datas já ocupadas por outras reservas confirmadas.

**Fluxo**
1. Frontend consulta `GET /place/:uid` que inclui os bookings existentes
2. Datas com status `CONFIRMED` ou `IN_PROGRESS` são marcadas como indisponíveis no calendário
3. Backend revalida a disponibilidade no momento de criar a reserva (`POST /booking`) com a função `checkAvailability()`

**Entradas:** `availability` do espaço + bookings existentes
**Saídas:** datas bloqueadas no calendário; validação server-side no ato da criação

---

### 4.3 — Seleção de horário de entrada e saída ✅

**Descrição**
Etapa de seleção de horário quando o espaço aceita reserva por hora.

**Telas envolvidas**
`/private/booking/hours?uid=`

**Fluxo**
1. Usuário escolhe horário de entrada e saída dentro dos horários disponíveis do espaço
2. Horários são salvos no `BookingProvider`
3. Avança para `/booking/guests`

**Entradas:** horário de entrada e saída
**Saídas:** horários salvos no contexto de reserva

---

### 4.4 — Seleção de hóspedes adicionais ✅

**Descrição**
Permite informar quantos hóspedes adicionais além do titular irão utilizar o espaço.

**Telas envolvidas**
`/private/booking/guests?uid=`

**Fluxo**
1. Usuário incrementa/decrementa o número de hóspedes adicionais
2. Custo adicional por hóspede é calculado e exibido em tempo real
3. Avança para `/booking/confirm`

**Entradas:** número de hóspedes adicionais (inteiro ≥ 0)
**Saídas:** valor adicional incorporado ao total; campo `details.additionalGuests` na reserva

---

### 4.5 — Resumo e confirmação da reserva ✅

**Descrição**
Tela de resumo final antes de confirmar. Exibe todos os detalhes e permite selecionar a forma de pagamento.

**Telas envolvidas**
`/private/booking/confirm?uid=`

**Fluxo**
1. Exibe resumo: espaço, datas, horários, hóspedes, discriminação de valores
2. Calcula e exibe: subtotal, taxa de limpeza, hóspedes adicionais, desconto (se aplicável), **total**
3. Exibe cartões de crédito cadastrados no perfil para seleção
4. Usuário seleciona o cartão e clica em "Confirmar reserva"
5. Frontend chama `POST /booking` com: `placeUid`, `userUid`, `paymentIuid`, `details` (checkIn, checkOut, additionalGuests), `totalPrice`, `bookingType`
6. Reserva criada com status `PENDING`
7. Redirecionado para a tela de status da reserva

**Entradas:** dados acumulados nas etapas anteriores + cartão selecionado
**Saídas:** booking criado no banco com status `PENDING`

---

### 4.6 — Processamento do pagamento ❌

**Descrição**
Cobrança real do valor da reserva no cartão de crédito selecionado.

**Fluxo esperado**
1. No momento da confirmação (4.5), API envia requisição de cobrança ao gateway
2. Gateway retorna aprovação ou recusa
3. Status do pagamento (`paymentStatus`) é atualizado na reserva
4. Em caso de recusa: usuário é notificado e pode tentar outro cartão
5. Webhook do gateway (`POST /booking/pay/confirmation/:acquirer`) confirma a transação de forma assíncrona

**Estado atual:** toda a infraestrutura de campos existe (acquirerOrderUid, acquirerName, paymentStatus), mas nenhum gateway está integrado e o método de processamento está completamente desativado no código.

---

### 4.7 — Acompanhamento do status da reserva ✅

**Descrição**
Tela que o locatário acessa para ver o estado atual de uma reserva realizada.

**Telas envolvidas**
`/private/status-book/:uid`

**Fluxo**
1. Usuário acessa a reserva pela tela de reservas (5.1 do bloco 5)
2. Exibe: dados do espaço, datas, horários, hóspedes adicionais
3. Exibe: comodidades, configurações, regras, mapa de localização, instruções de check-in, política de cancelamento
4. Status exibido com cor correspondente:
   - `PENDING` → laranja → "Aguardando confirmação..."
   - `CONFIRMED` → verde → "Reserva confirmada"
   - `REJECTED` → vermelho → "Reserva rejeitada"
   - `COMPLETED` → "Reserva concluída"
   - `CANCELED` → "Reserva cancelada"
5. Botão "Conversar com o anfitrião" abre o chat (Bloco 8)
6. Botão "Cancelar reserva" aparece apenas para reservas com status `COMPLETED` (provavelmente bug — deveria aparecer para `CONFIRMED`)

**Entradas:** `uid` da reserva
**Saídas:** visualização completa do estado da reserva

---

### 4.8 — Cancelamento de reserva pelo locatário ⚠️

**Descrição**
Permite que o locatário cancele uma reserva existente.

**Telas envolvidas**
`/private/status-book/cancel?uid=`

**Fluxo**
1. Usuário clica em "Cancelar reserva" na tela de status
2. Tela exibe confirmação com resumo da reserva e aviso sobre a política de cancelamento
3. Usuário confirma o cancelamento
4. Frontend chama `PATCH /booking/:id` com `bookingStatus: CANCELED`
5. Reserva é marcada como cancelada

**Entradas:** `uid` da reserva
**Saídas:** `bookingStatus: CANCELED` na reserva
**Lacuna:** nenhuma política de cancelamento é aplicada (prazo mínimo, multa, estorno). A política exibida na tela é apenas visual.

---

## Bloco 5 — Reservas do Locatário (lista e histórico)

---

### 5.1 — Lista de reservas com filtro por status ✅

**Descrição**
Painel do locatário com todas as suas reservas, filtradas por estado.

**Telas envolvidas**
`/private/reservations`

**Fluxo**
1. Frontend chama `GET /user/:uid?select[booking]=true` para obter os bookings do usuário
2. Para cada booking, busca os dados do espaço correspondente
3. Exibe abas de filtragem:
   - **Ativas:** status `PENDING`, `CONFIRMED`, `PROCESSING`, `IN_PROGRESS`
   - **Inativas:** status `CANCELED`, `REJECTED`
   - **Anteriores:** status `COMPLETED`
4. Cada item da lista é clicável e leva para `/status-book/:uid`
5. Para reservas concluídas, exibe botão de avaliação (abre modal)

**Entradas:** `uid` do usuário logado
**Saídas:** lista de reservas agrupadas por status

---

### 5.2 — Modal de avaliação pós-reserva ⚠️

**Descrição**
Modal acionado na lista de reservas anteriores para o locatário avaliar o espaço utilizado.

**Telas envolvidas**
`/private/reservations` (modal inline)

**Fluxo**
1. Na aba "anteriores", cada reserva concluída exibe botão "Avaliar"
2. Modal abre com campos: Ambiente, Comodidades, Geral, Localização, Atendimento (escala de 1 a 5) + campo de comentário
3. Média das notas é calculada automaticamente
4. Ao confirmar, frontend chama `POST /rating` com os dados
5. Modal fecha e status muda para "Avaliado"

**Entradas:** notas por critério + comentário + `placeUid`
**Saídas:** rating criado no banco associado ao espaço
**Lacuna:** avaliação funciona para espaços. Não há fluxo para avaliar o proprietário (apesar de o backend suportar `ratingType: owner`).

---

## Bloco 6 — Cadastro de Espaço (proprietário)

> Fluxo multi-step com progresso salvo em `localStorage` sob a chave `@nalida/create-place`. Cada etapa lê e escreve no contexto `AddPlaceProvider`. O espaço é criado no banco apenas na etapa final.

---

### 6.1 — Informações gerais ✅

**Telas:** `/private/lessee/form-place/initial-info`

**Fluxo**
1. Proprietário informa: título do espaço, tipo de espaço (`spaceType`), categoria e subcategoria (`category`)
2. Frontend carrega opções de `GET /category` e `GET /spaceType`
3. Subcategorias são filtradas dinamicamente conforme a categoria selecionada
4. Ao avançar, dados são salvos no contexto e no `localStorage`

**Entradas:** título, `spaceTypeUid`, `categoryUid`, `subcategoryUid`

---

### 6.2 — Endereço com consulta por CEP ✅

**Telas:** `/private/lessee/form-place/address`

**Fluxo**
1. Proprietário digita o CEP
2. Frontend chama `GET /external/address/:cep` → Brasil API
3. Campos de rua, bairro, cidade, estado são preenchidos automaticamente
4. Proprietário complementa com número e complemento

**Entradas:** CEP, número, complemento
**Saídas:** endereço completo + geolocalização calculada pelo maps

---

### 6.3 — Configurações físicas ✅

**Telas:** `/private/lessee/form-place/space-configs`

**Fluxo**
1. Proprietário preenche: capacidade máxima de pessoas, número de banheiros, tamanho em m² e velocidade de internet

**Entradas:** `maximumCapacity`, `numberOfBathrooms`, `size`, `internetSpeed`

---

### 6.4 — Valores e preços ✅

**Telas:** `/private/lessee/form-place/values`, `/private/lessee/form-place/hour`

**Fluxo**
1. Proprietário define: valor da diária, taxa de limpeza, custo de hóspede adicional por dia
2. Se habilitar reserva por hora: também define valor por hora e custo adicional por hora

**Entradas:** `dailyRate`, `hourRate`, `cleaningFee`, `additionalGuestDay`, `additionalGuestHour`, `allowsBookPerHour`

---

### 6.5 — Desconto para estadias longas ✅

**Telas:** `/private/lessee/form-place/discount`

**Fluxo**
1. Proprietário define quantidade mínima de dias para ativar o desconto e o percentual de desconto

**Entradas:** `minimumStay` (dias), `percentageDiscount` (%)

---

### 6.6 — Disponibilidade e horários ✅

**Telas:** `/private/lessee/form-place/schedule`

**Fluxo**
1. Proprietário seleciona os dias da semana em que o espaço está disponível
2. Para cada dia: define horário de abertura e fechamento
3. Define a estadia mínima em horas

**Entradas:** dias da semana com intervalos de horário, `minimumStayInHours`

---

### 6.7 — Comodidades ✅

**Telas:** `/private/lessee/form-place/initial-info` (seção conveniences)

**Fluxo**
1. Frontend carrega lista de comodidades disponíveis via `GET /conveniences`
2. Proprietário seleciona quais o espaço oferece (checkboxes)

**Entradas:** lista de `convenienceUid` selecionados

---

### 6.8 — Regras e instrução de check-in ✅

**Telas:** `/private/lessee/form-place/rules`

**Fluxo**
1. Proprietário preenche as regras do espaço (texto livre)
2. Preenche as instruções de check-in (como acessar, senha, contato)

**Entradas:** `rule` (texto), `checkInInstruction` (texto)

---

### 6.9 — Upload de fotos ⚠️

**Telas:** `/private/lessee/form-place/images`

**Fluxo**
1. Proprietário seleciona fotos do dispositivo
2. Frontend faz upload direto para Firebase Storage via `useFirebaseStorage`
3. URL pública retornada é armazenada no array `assets` do contexto
4. Fotos são exibidas com preview antes de avançar

**Entradas:** arquivos de imagem
**Saídas:** array de URLs do Firebase Storage
**Lacuna:** sem validação de formato (MIME), tamanho máximo por imagem nem quantidade máxima de fotos. Sem moderação de conteúdo impróprio.

---

### 6.10 — Política de cancelamento ✅

**Telas:** `/private/lessee/form-place/rules` (seleção de política)

**Fluxo**
1. Frontend carrega opções de políticas via `GET /cancellation-policy`
2. Proprietário seleciona a política que se aplica ao espaço

**Entradas:** `cancellationPolicyUid`

---

### 6.11 — Publicação do espaço ⚠️

**Telas:** `/private/lessee/form-place/result`

**Fluxo**
1. Tela exibe resumo de todas as informações preenchidas
2. Proprietário confirma → Frontend chama `POST /place` com todos os dados acumulados
3. Espaço é criado no banco
4. `localStorage` é limpo
5. Proprietário é redirecionado para `/private/lessee` (lista de espaços)

**Entradas:** todos os campos acumulados nas etapas anteriores
**Saídas:** espaço criado com status ativo e imediatamente visível na plataforma
**Lacuna:** não há etapa de revisão ou moderação. O espaço é publicado diretamente.

---

## Bloco 7 — Dashboard e Métricas do Proprietário

---

### 7.1 — Dashboard principal do proprietário ✅

**Telas:** `/private/lessee/info-place/:uid`

**Fluxo**
1. Proprietário acessa o detalhe de um espaço cadastrado
2. Frontend chama em paralelo:
   - `GET /reports/quantity-of-bookings/:placeUid`
   - `GET /reports/monthly-billing/:placeUid`
   - `GET /reports/quantity-of-guest/:placeUid`
3. Dados dos últimos 6 meses são exibidos em gráficos (recharts)

---

### 7.2 — Quantidade de reservas por mês ✅

**Descrição:** Gráfico de barras com o número de reservas criadas por mês nos últimos 6 meses.

**Entradas:** `placeUid`
**Saídas:** objeto `{ [mês]: quantidade }`

---

### 7.3 — Faturamento mensal ✅

**Descrição:** Gráfico com a soma do `totalPrice` de todas as reservas por mês nos últimos 6 meses.

**Entradas:** `placeUid`
**Saídas:** objeto `{ [mês]: valorTotal }`
**Observação:** faturamento reflete o `totalPrice` enviado pelo frontend, não o valor efetivamente cobrado (que não existe — ver item 4.6).

---

### 7.4 — Quantidade de hóspedes por mês ✅

**Descrição:** Gráfico com o total de hóspedes (titular + adicionais) por mês nos últimos 6 meses.

**Entradas:** `placeUid`
**Saídas:** objeto `{ [mês]: totalHóspedes }`

---

### 7.5 — Taxa de ocupação do espaço ❌

**Descrição esperada:** percentual de dias/horas disponíveis que foram efetivamente reservados.
**Estado atual:** não existe em nenhuma camada.

---

### 7.6 — Receita acumulada no ano (YTD) ❌

**Descrição esperada:** total faturado no ano corrente.
**Estado atual:** não existe em nenhuma camada.

---

### 7.7 — Ranking de horários mais reservados ❌

**Descrição esperada:** visualização de quais dias ou horários têm maior demanda.
**Estado atual:** não existe em nenhuma camada.

---

## Bloco 8 — Chat e Mensagens

---

### 8.1 — Lista de conversas ativas ⚠️

**Telas:** `/private/conversations`

**Fluxo**
1. Frontend lê do Firebase Realtime Database o nó `users/:uid/chats/:appMode`
2. Para cada conversa encontrada, busca os dados do usuário destino via `GET /user/:targetUid`
3. Exibe lista de conversas com nome, avatar, última mensagem e status (aberta/fechada)
4. Toggle "abertas / fechadas" filtra a lista
5. Clicar em uma conversa navega para `/conversations/chat/:targetUid`

**Entradas:** `uid` do usuário logado + `appMode` (lessor ou lessee)
**Saídas:** lista de conversas com prévia da última mensagem

---

### 8.2 — Chat em tempo real ⚠️

**Telas:** `/private/conversations/chat/:uid`

**Fluxo**
1. Frontend carrega o histórico de mensagens do nó `chats/:chatUid/messages` no Firebase
2. Listener em tempo real (`onValue`) atualiza a tela automaticamente quando chega nova mensagem
3. Usuário digita mensagem no campo de texto e envia
4. Se é a primeira mensagem: cria novo nó no Firebase com `push()` e registra a conversa para ambos os lados (lessor/lessee)
5. Mensagem é adicionada ao nó `chats/:chatUid/messages` com `content`, `senderUid`, `timestamp`
6. Scroll automático para a última mensagem

**Entradas:** texto da mensagem
**Saídas:** mensagem persistida no Firebase RTDB em tempo real

---

### 8.3 — Histórico de mensagens ⚠️

**Descrição:** Mensagens enviadas são persistidas no Firebase Realtime Database e recuperadas a cada acesso.

**Lacuna:** histórico não é sincronizado com o MongoDB. Se o nó do Firebase for deletado ou o projeto Firebase for trocado, todo o histórico de mensagens é perdido.

---

### 8.4 — Notificação de nova mensagem ❌

**Descrição esperada:** badge de contador no ícone de mensagens e/ou push notification quando uma mensagem chegar enquanto o usuário está offline.

**Estado atual:** sem implementação. O usuário só vê mensagens novas se estiver com a tela de conversas aberta.

---

## Bloco 9 — Gestão de Reservas pelo Proprietário

---

### 9.1 — Lista de reservas pendentes ✅

**Telas:** `/private/lessee/approve-booking/:uid`

**Fluxo**
1. Frontend chama `GET /place?where[owner][uid]=:uid&where[booking][some][bookingStatus]=PENDING&include[booking][include][user]=true`
2. Exibe cards de cada espaço com bookings pendentes
3. Cada booking pendente mostra: nome do locatário, datas, horários, hóspedes adicionais
4. Clicar no booking abre a tela de decisão (9.2)

---

### 9.2 — Aprovar ou negar reserva ✅

**Telas:** `/private/lessee/approve-booking/approve/:uid`

**Fluxo**
1. Proprietário visualiza o detalhe do booking: dados do espaço, locatário, datas e horários
2. Dois botões de ação:
   - **Confirmar reserva:** chama `PATCH /booking/:uid` com `bookingStatus: CONFIRMED` → redireciona para `/approve-booking/approve/confirmed`
   - **Negar reserva:** redireciona para `/approve-booking/approve/deny?uid=:uid`

---

### 9.3 — Confirmação de aprovação ✅

**Telas:** `/private/lessee/approve-booking/approve/confirmed`

**Fluxo**
1. Tela exibe mensagem de sucesso da confirmação
2. Botão "Voltar" retorna para a lista de pendentes

---

### 9.4 — Negar reserva com motivo ✅

**Telas:** `/private/lessee/approve-booking/approve/deny`

**Fluxo**
1. Proprietário visualiza o booking a ser negado
2. Confirma a negação
3. Frontend chama `PATCH /booking/:uid` com `bookingStatus: REJECTED`
4. Redirecionado de volta à lista de pendentes

---

### 9.5 — Lista de reservas concluídas ✅

**Telas:** `/private/lessee/completed-booking/:uid`

**Fluxo**
1. Mesma estrutura da lista de pendentes, filtrada por `bookingStatus: COMPLETED`
2. Exibe histórico de reservas finalizadas com dados do locatário e período utilizado

---

### 9.6 — Agenda do espaço ⚠️

**Telas:** `/private/lessee/schedule`

**Fluxo**
1. Proprietário acessa a agenda do espaço
2. Calendário visual exibe os dias com reservas ativas
3. Cada dia reservado mostra: locatário, horário, status

**Lacuna:** sem endpoint dedicado de agenda. A tela depende de consulta genérica de bookings. Sem agrupamento server-side por dia ou semana.

---

### 9.7 — Status do hóspede no dia ⚠️

**Telas:** `/private/lessee/schedule/status-guest`

**Fluxo esperado**
1. No dia da reserva, proprietário pode marcar se o hóspede fez check-in e check-out
2. Status atualizado reflete na reserva

**Lacuna:** tela existe, mas backend não possui campos de presença (check-in/check-out confirmados pelo proprietário). O status não é persistido.

---

## Bloco 10 — Perfil do Usuário

---

### 10.1 — Visualizar perfil próprio ✅

**Telas:** `/private/profile/:uid`

**Fluxo**
1. Frontend chama `GET /user/:uid`
2. Exibe: nome, e-mail, avatar, data de nascimento, telefones, endereços
3. Links rápidos para edição de cada seção
4. Toggle de modo de uso (lessor ↔ lessee) com validação de completude do perfil para ativar o modo lessee

---

### 10.2 — Editar nome ✅

**Telas:** `/private/profile/name/:uid`

**Fluxo**
1. Usuário edita nome e sobrenome
2. Frontend chama `PATCH /user/:id` com `firstName` e `lastName`

---

### 10.3 — Editar data de nascimento ⚠️

**Telas:** `/private/profile/birthday/:uid`

**Fluxo**
1. Usuário seleciona a data de nascimento com um date picker
2. Frontend chama `PATCH /user/:id` com `profile.birthDay`

**Lacuna:** campo `birthDay` existe no `type Profile` do Prisma schema, mas não há migração/validação garantida no backend. O campo pode não persistir corretamente em todos os casos.

---

### 10.4 — Gerenciar endereços ✅

**Telas:** `/private/profile/address/:uid`

**Fluxo**
1. Usuário adiciona ou edita um endereço
2. Consulta automática por CEP (igual ao fluxo 6.2)
3. Frontend chama `PATCH /user/:id` com o array `addresses` atualizado

---

### 10.5 — Adicionar cartão de crédito ✅

**Telas:** `/private/profile/payment-method/create`

**Fluxo**
1. Usuário preenche os dados do cartão: número, nome do titular, validade, CVV, documento (CPF)
2. Frontend chama `POST /user/payment/:userUid`
3. Backend encripta número do cartão e CVV antes de armazenar
4. Armazena apenas `firstSixDigits` e `lastFourDigits` visíveis

**Entradas:** dados completos do cartão
**Saídas:** cartão adicionado ao perfil com dados sensíveis encriptados

---

### 10.6 — Remover cartão de crédito ✅

**Telas:** `/private/profile/payment-method/edit`

**Fluxo**
1. Usuário acessa o cartão que deseja remover
2. Confirma a exclusão
3. Frontend chama `DELETE /user/payment/:userUid/:iuid`
4. Cartão removido do array `paymentMethods` do usuário

---

### 10.7 — Cadastrar conta bancária para recebimento ⚠️

**Telas:** `/private/profile/receiver-method/:uid`

**Fluxo**
1. Frontend carrega lista de bancos via `GET /external/bank`
2. Usuário preenche: banco, agência, conta, tipo de conta
3. Frontend chama `PATCH /user/:id` com `receiverMethods`

**Lacuna:** campo `receiverMethods: Json?` armazena os dados sem validação bancária. Sem integração com gateway de pagamento para configurar repasses automáticos.

---

### 10.8 — Verificação de identidade (documento + selfie) ❌

**Telas:** `/private/profile/document/:uid` → `/private/profile/document/confirm` → `/private/profile/document/picture`

**Fluxo existente no frontend**
1. Usuário acessa a seção de documentos no perfil
2. Tela informa que serão necessárias fotos da frente e verso do documento
3. Câmera é aberta via `react-webcam`
4. Usuário fotografa frente → confirma → fotografa verso
5. Selfie é capturada
6. Imagens são enviadas para Firebase Storage
7. URLs salvas no perfil

**Lacuna:** nenhuma análise ou validação das imagens é realizada. Não há integração com serviço de KYC (ex: Idwall, Serpro, Unico). O fluxo existe visualmente, mas não comprova identidade.

---

### 10.9 — Visualizar perfil de outro usuário ✅

**Telas:** `/private/profile/guest-profile/:uid`

**Fluxo**
1. A partir de uma reserva ou conversa, usuário acessa o perfil público de outro usuário
2. Frontend chama `GET /user/:uid`
3. Exibe: nome, avatar, data de cadastro, avaliações recebidas

---

### 10.10 — Alternância de modo de uso (lessor ↔ lessee) ✅

**Telas:** `/private/profile/:uid` (toggle no perfil)

**Fluxo**
1. Usuário toca no toggle de modo no perfil
2. `GlobalClientProvider` atualiza `appMode`
3. Sidebar e rotas disponíveis mudam conforme o modo
4. Lógica de validação (comentada no código) prevê checar completude do perfil antes de ativar o modo lessee

---

## Bloco 11 — Avaliações

---

### 11.1 — Exibir nota média do espaço ✅

**Telas:** `/private/place?uid=` (card + detalhe)

**Fluxo**
1. Frontend chama `GET /rating/average/:uid`
2. Média e número de avaliações exibidos junto ao nome do espaço

---

### 11.2 — Submeter avaliação de espaço ⚠️

**Telas:** modal em `/private/reservations`

**Fluxo (frontend implementado)**
1. Modal com critérios: Ambiente, Comodidades, Geral, Localização, Atendimento (1–5)
2. Campo de comentário texto livre
3. Média calculada automaticamente
4. Frontend chama `POST /rating` com: `title`, `body`, `rating`, `ratingType: place`, `evaluatedUid`, `evaluatorUid`

**Lacuna:** tela de listagem de avaliações do espaço não existe. O usuário submete mas não consegue ver as avaliações de outros.

---

### 11.3 — Listar avaliações do espaço ⚠️

**Estado atual:** endpoint `GET /rating?where[evaluatedUid]=:uid` existe no backend. Nenhuma tela no frontend exibe a lista de reviews de um espaço.

---

### 11.4 — Avaliar proprietário ou locatário ⚠️

**Estado atual:** backend suporta `ratingType: owner` e `ratingType: renter`. Nenhuma tela no frontend permite submeter esse tipo de avaliação.

---

## Bloco 12 — Pagamento

---

### 12.1 — Cadastrar cartão de crédito ✅

> Ver fluxo completo em **10.5**

---

### 12.2 — Selecionar forma de pagamento na reserva ✅

**Telas:** `/private/booking/confirm?uid=`

**Fluxo**
1. Na tela de confirmação da reserva, exibe os cartões cadastrados no perfil
2. Usuário seleciona o cartão desejado
3. `paymentIuid` do cartão selecionado é enviado junto ao `POST /booking`

---

### 12.3 — Processar cobrança ❌

**Fluxo esperado**
1. Backend recebe `POST /booking` com `paymentIuid`
2. Recupera os dados do cartão no perfil do usuário (número encriptado)
3. Descriptografa e envia ao gateway de pagamento
4. Gateway retorna status da transação
5. `paymentStatus` e `acquirerOrderUid` são atualizados na reserva

**Estado atual:** sem gateway integrado. Nenhuma cobrança é realizada.

---

### 12.4 — Webhook de confirmação do gateway ❌

**Fluxo esperado**
1. Gateway envia `POST /booking/pay/confirmation/:acquirer` ao ser confirmada a transação
2. Backend atualiza `paymentStatus: PAID` na reserva
3. Status da reserva avança para `PROCESSING` ou `CONFIRMED`

**Estado atual:** endpoint existe mas método está comentado e sem lógica.

---

### 12.5 — Repasse ao proprietário ❌

**Fluxo esperado**
1. Após a reserva ser concluída, gateway executa split: Nalida recebe taxa da plataforma, proprietário recebe o restante na conta cadastrada
2. Registro de repasse salvo no histórico

**Estado atual:** sem implementação em nenhuma camada.

---

### 12.6 — Reembolso em cancelamentos ❌

**Fluxo esperado**
1. Ao cancelar uma reserva (4.8), sistema verifica a política de cancelamento
2. Se dentro do prazo: reembolso total processado no gateway
3. Se fora do prazo: reembolso parcial ou nenhum conforme política

**Estado atual:** sem implementação. Cancelamentos não geram nenhuma ação financeira.

---

### 12.7 — Histórico de transações ❌

**Fluxo esperado:** tela no perfil com extrato de pagamentos realizados e recebidos.
**Estado atual:** sem implementação em nenhuma camada.

---

## Bloco 13 — Notificações

---

### 13.1 a 13.6 — Todas as notificações ❌

| ID | Tipo | Gatilho |
|---|---|---|
| 13.1 | Push | Reserva aprovada pelo proprietário |
| 13.2 | Push | Nova reserva pendente (para o proprietário) |
| 13.3 | Push | Nova mensagem no chat |
| 13.4 | E-mail | Confirmação de reserva criada |
| 13.5 | E-mail | Boas-vindas após cadastro |
| 13.6 | E-mail | Lembrete 24h antes do check-in |

**Estado atual:** nenhum dos gatilhos acima está implementado em nenhuma camada. Não há integração com FCM, SendGrid, Resend ou serviço equivalente.

---

## Bloco 14 — App Mobile

---

### 14.1 — Acesso via WebView ⚠️

**Descrição**
O app mobile carrega a versão web da Nalida dentro de um componente WebView React Native.

**Fluxo**
1. Usuário abre o app
2. WebView carrega a URL configurada em `src/env.ts`
3. Toda a navegação acontece dentro do WebView

**Lacuna:** comportamento dependente da URL configurada. Em desenvolvimento, aponta para `localhost`, o que impede uso real no dispositivo sem configuração adicional.

---

### 14.2 — Build e distribuição via EAS ✅

**Descrição**
O projeto está configurado com Expo Application Services para geração de builds e distribuição OTA.

**Scripts disponíveis:**
- `eas build --platform all` — gera builds para iOS e Android
- `eas update --auto` — publica atualização OTA sem nova submissão nas lojas

---

*Documento produzido pela TrinityWeb como parte da entrega da Fase Discover do projeto Nalida — Maio 2026.*
