# Frontend Routes — nalida-web

Mapeamento completo de todas as rotas do app Next.js (`apps/nalida-web`), com descrição e funcionalidades práticas de cada uma.

> O app possui dois modos de uso: **lessor** (quem aluga o espaço) e **lessee** (quem disponibiliza o espaço). Funciona como uma plataforma de aluguel de espaços comerciais.

---

## Rotas Públicas

### `/welcome`
Tela de boas-vindas pós-login.
- Solicita permissão de geolocalização do navegador
- Redireciona para o dashboard correto conforme o modo ativo (lessee ou lessor)

### `/notifications`
Solicitação de permissão para notificações push.
- Botão para avançar após autorização

### `/privacy`
Exibição dos termos de privacidade.
- Botão "Aceitar" que marca os termos como lidos no contexto global

---

## Rotas Compartilhadas (auth)

### `/login`
Tela de autenticação principal.
- Login com Google (ativo)
- Placeholders para Apple e Facebook (comentados)
- Verificação de sessão ativa com redirect automático

### `/manual-login`
Login tradicional com email e senha.
- Formulário com validação de credenciais

### `/register` → `/register/step-one` → `/register/step-two`
Cadastro em 2 etapas.
- Step 1: email e senha
- Step 2: nome e data de nascimento
- Validação progressiva entre etapas

### `/under-age`
Tela de bloqueio para menores de 18 anos.
- Sem opção de prosseguimento

---

## Rotas Privadas — Home (modo Lessor)

### `/private`
Dashboard principal do modo lessor.
- Lista espaços por categoria (clínicas, salas de estudo, escritórios) próximos ao usuário
- Busca por texto (cidade ou bairro)
- Geolocalização automática
- 5 resultados por categoria com paginação implícita

### `/private/more?category=&slug=`
Listagem completa de espaços de uma categoria.
- Visualização em lista ou mapa (Google Maps)
- Filtros: faixa de preço, comodidades, distância
- Marcadores no mapa com popup de card ao clicar
- Busca por texto
- Contagem de resultados

### `/private/place?uid=`
Detalhes completos de um espaço.
- Fotos, descrição, preços (diária, hora, hóspede adicional, taxa de limpeza)
- Comodidades, capacidade, banheiros, velocidade de internet
- Regras, política de cancelamento, instruções de check-in
- Localização no Google Maps
- Botão para iniciar reserva

---

## Rotas Privadas — Fluxo de Reserva (Lessor)

### `/private/booking/calendar?uid=`
Seleção de datas — 1ª etapa da reserva.
- Calendário com desabilitação de dias passados e dias sem disponibilidade
- Exibe desconto para reservas longas (quando aplicável)
- Cálculo de preço em tempo real

### `/private/booking/hours?uid=`
Seleção de horários — 2ª etapa.
- Seletor de entrada e saída respeitando horário de funcionamento
- Toggle "Reservar dia inteiro"
- Atualização dinâmica do preço

### `/private/booking/guests?uid=`
Quantidade de hóspedes adicionais — 3ª etapa.
- Input numérico com limite baseado na capacidade do espaço
- Exibe valor por hóspede adicional

### `/private/booking/confirm?uid=`
Resumo e pagamento — 4ª etapa.
- Cálculo detalhado: diária/hora × dias, hóspedes adicionais, taxa de limpeza, desconto
- Seleção de cartão de crédito cadastrado
- Envio da reserva para a API

### `/private/reservations`
Histórico de reservas do usuário (como hóspede).
- Abas: ativas, inativas, anteriores
- Modal de avaliação do espaço (reservas concluídas)
- Status visual de cada reserva

### `/private/status-book/[uid]`
Detalhes de uma reserva específica.
- Datas, horários, espaço, comodidades, mapa
- Ações: conversar com anfitrião, cancelar reserva

### `/private/status-book/cancel`
Fluxo de cancelamento de reserva.
- Exibe política de cancelamento
- Campo de motivo
- Confirmação antes de enviar

---

## Rotas Privadas — Conversas

### `/private/conversations`
Lista de conversas.
- Abas: abertas e fechadas
- Prévia da última mensagem e avatar do usuário

### `/private/conversations/chat/[uid]`
Chat em tempo real via Firebase Realtime Database.
- Histórico de mensagens
- Campo de envio
- Marca conversa como aberta/fechada

---

## Rotas Privadas — Lessee (modo Anfitrião)

### `/private/lessee` → `/private/lessee/my-place`
Dashboard do anfitrião. Lista os espaços cadastrados pelo usuário.
- Ações: editar, visualizar, deletar
- Status ativo/inativo de cada espaço

---

### Criação e Edição de Espaço — `/private/lessee/form-place`

Formulário multi-step com barra de progresso. Suporta criação (`/form-place/step`) e edição (`/form-place/step/[uid]`). Dados persistidos em `localStorage` com a chave `@nalida/create-place`.

---

#### Step 1 — `initial-info` (10%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| Nome do lugar | Text input | `title` | Obrigatório | `textTransform: capitalize` |
| Categoria | Select | `category` | — | Opções carregadas da API `/category` (apenas itens sem `parentUid`) |
| Subcategoria | Select | `subCategory` | — | Filtrada dinamicamente pela categoria selecionada; desabilitada se não houver opções |
| Tipo de espaço | Select | `spaceTypeUid` | — | Opções carregadas da API `/spaceType` |
| Lotação máxima | Input numérico | `maximumCapacity` | Mínimo: 1 | Sufixo "pessoas" |

---

#### Step 2 — `address` (20%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| CEP | Text input | `zipCode` | Obrigatório; exatamente 8 dígitos | Máscara de CEP; ao completar 8 dígitos consulta ViaCEP automaticamente |
| Estado | Text input | `state` | Obrigatório (preenchido via ViaCEP) | Desabilitado; preenchido automaticamente |
| Cidade | Text input | `city` | Obrigatório (preenchido via ViaCEP) | Desabilitado; preenchido automaticamente |
| Bairro | Text input | `neighborhood` | Obrigatório (preenchido via ViaCEP) | Desabilitado; preenchido automaticamente |
| Rua | Text input | `address` | Obrigatório | Desabilitado; preenchido automaticamente via ViaCEP |
| Número | Text input | `number` | Obrigatório | Máscara numérica; ao preencher dispara geocodificação (Google Maps API) |
| Complemento | Text input | `complement` | — | Opcional |
| Latitude | Hidden input | `lat` | — | Preenchido automaticamente via Google Maps Geocoding |
| Longitude | Hidden input | `lng` | — | Preenchido automaticamente via Google Maps Geocoding |

---

#### Step 3 — `schedule` (30%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| Dias de funcionamento | Inline checkbox | `schedule` | Obrigatório (ao menos 1 dia) | Opções: Dom (0), Seg (1), Ter (2), Qua (3), Qui (4), Sex (5), Sab (6) |
| Horário de entrada | Hour picker | `hours[0]` | — | Parte do componente `HourPicker`; horas anteriores ao horário de entrada ficam desabilitadas no campo de saída |
| Horário de saída | Hour picker | `hours[1]` | — | Desabilita horas ≤ horário de entrada selecionado |

---

#### Step 4 — `values` (40%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| Valor diária | Text input | `dailyRate` | Obrigatório | Máscara de moeda (R$) |
| Valor diária por hóspede adicional | Text input | `additionalGuestDay` | Obrigatório | Máscara de moeda (R$) |
| Taxa de limpeza | Text input | `cleeaningFee` | Obrigatório | Máscara de moeda (R$); note: nome interno tem typo (`cleeaningFee`) |

---

#### Step 5 — `hour` (50%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| Permite reserva por hora? | Switcher | `allowsBookPerHour` | — | Valores: `"true"` / `"false"`; controla habilitação dos campos abaixo |
| Valor hora | Text input | `hourRate` | Obrigatório | Máscara de moeda (R$); desabilitado se `allowsBookPerHour = false` |
| Valor hora por hóspede adicional | Text input | `additionalGuestHour` | Obrigatório | Máscara de moeda (R$); desabilitado se `allowsBookPerHour = false` |
| Estadia mínima | Input numérico | `minimumStayInHours` | Mínimo: 1; Máximo: 24 | Sufixo "horas"; desabilitado se `allowsBookPerHour = false` |

---

#### Step 6 — `discount` (60%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| Oferece desconto para longas reservas? | Switcher | `canDiscount` | — | Valores: `"true"` / `"false"`; controla habilitação dos campos abaixo |
| Estadia mínima para desconto | Input numérico | `minimumStay` | Mínimo: 1 | Sufixo "dias"; desabilitado se `canDiscount = false` |
| Percentual de desconto | Input numérico | `percentageDiscount` | Mínimo: 1 | Sufixo "%"; desabilitado se `canDiscount = false` |

---

#### Step 7 — `space-configs` (70%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| Metragem da sala | Input numérico | `size` | Mínimo: 1 | Sufixo "metros" |
| Número de banheiros | Input numérico | `numberOfBathrooms` | Mínimo: 0 | — |
| Velocidade da internet | Input numérico | `internetSpeed` | Mínimo: 0 | Sufixo "mbps" |
| Comodidades | Toggle list | `convenienceUid` | — | Opções carregadas da API com ícones por slug; seleção múltipla |

---

#### Step 8 — `rules` (80%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| Política de cancelamento | Select | `cancellationPolicyUid` | — | Opções carregadas da API `/cancellationPolicy` |
| Texto da política | Textarea | `textRules` | — | Somente leitura; preenchido automaticamente com o `body` da política selecionada |
| Regras do espaço | Textarea | `rule` | Obrigatório | 8 linhas |
| Instruções de check-in | Textarea | `checkInInstruction` | Obrigatório | 8 linhas |

---

#### Step 9 — `guests` (85%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| Preferências de hóspedes | Toggle list | `guests` | — | Seleção múltipla; opções: `acceptOnlyRecommended` (aceitar só recomendados por outros anfitriões) e `acceptOnlyAlreadyBooked` (aceitar só quem já fez reservas no app) |

---

#### Step 10 — `images` (90%)

| Campo | Tipo | Nome interno | Validações | Observações |
|-------|------|-------------|------------|-------------|
| Imagens do espaço | Input file | `images` | Obrigatório; ao menos 1 imagem | Aceita `image/*`; múltiplos arquivos; preview das imagens selecionadas; primeira imagem é a capa; upload para Firebase Storage antes de salvar |

---

#### `result` (100%)

Tela de confirmação. Exibe mensagem de sucesso, nome do espaço criado/editado e botão para voltar à listagem. Limpa o `localStorage` ao carregar.

---

### `/private/lessee/info-place/[uid]`
Estatísticas do espaço.
- Gráficos: reservas por mês, faturamento, quantidade de hóspedes
- Dados dos últimos 12 meses

### `/private/lessee/schedule`
Calendário de reservas do espaço.
- Visualiza reservas por mês
- Clica em data para ver hóspedes do dia
- Estatísticas: total de reservas e dias disponíveis

### `/private/lessee/schedule/status-guest`
Detalhes de uma reserva do ponto de vista do anfitrião.
- Informações completas: espaço, datas, horários, hóspede
- Ações: conversar com hóspede, cancelar reserva

### `/private/lessee/approve-booking/[uid]`
Lista de reservas pendentes de aprovação para um espaço.
- Filtro automático por status `PENDING`

### `/private/lessee/approve-booking/approve/[uid]`
Tela de confirmação ou negação de uma reserva pendente.
- Exibe informações da reserva e do hóspede
- Botões: confirmar ou negar

### `/private/lessee/approve-booking/approve/confirmed`
Confirmação visual de reserva aceita.
- Botões para voltar às reservas ou falar com o hóspede

### `/private/lessee/approve-booking/approve/deny`
Fluxo de negação de reserva.
- Campo de motivo
- Confirmação antes de enviar

### `/private/lessee/completed-booking/[uid]`
Lista de reservas concluídas de um espaço.
- Filtro automático por status `COMPLETED`

### `/private/lessee/completed-booking/approve/[uid]`
Tela de avaliação do hóspede.
- Seleção de estrelas e comentário
- Envio via API

### `/private/lessee/faq`
Perguntas frequentes.
- Cards expansíveis com pergunta e resposta

---

## Rotas Privadas — Perfil

### `/private/profile/[uid]`
Dashboard do perfil do usuário.
- Dados pessoais: nome, email, data de nascimento, telefone, documento, endereço
- Dados bancários: conta para recebimento
- Métodos de pagamento: cartões cadastrados
- Toggle para alternar entre modo lessee/lessor
- Links de edição para cada campo

### `/private/profile/name/[uid]`
Edição de nome e sobrenome.
- Validação obrigatória, salva via `PATCH /user`

### `/private/profile/birthday/[uid]`
Edição de data de nascimento.
- Máscara DD/MM/YYYY
- Valida maioridade (18+), redireciona para `/under-age` se menor

### `/private/profile/address/[uid]`
Edição de endereço.
- Busca automática por CEP (ViaCEP)
- Preenchimento automático de estado, cidade, bairro e rua
- Número e complemento manuais

### `/private/profile/document/[uid]` → `picture` → `confirm`
Fluxo de verificação de documento (CPF/CNPJ).
- Informa número do documento
- Captura frente e verso via câmera do dispositivo
- Preview com opção de repetir
- Upload para Firebase Storage
- Confirmação antes de salvar

### `/private/profile/payment-method`
Lista de cartões de crédito cadastrados.
- Ações: editar, deletar, definir como padrão
- Botão para adicionar novo cartão

### `/private/profile/payment-method/create`
Cadastro de novo cartão de crédito.
- Formulário com validação completa

### `/private/profile/payment-method/edit`
Edição de cartão existente.
- Carrega dados do cartão, permite edição e definir como padrão

### `/private/profile/receiver-method/[uid]`
Dados bancários para recebimento de pagamentos.
- Seleção de banco (lista completa)
- Tipo de conta: corrente, poupança ou pagamento
- CPF/CNPJ, razão social, agência e conta com dígitos

### `/private/profile/guest-profile/[uid]`
Perfil público de um hóspede.
- Informações: nome, foto, bio, membro desde
- Avaliações recebidas de anfitriões anteriores (estrelas + comentário)

---

## Resumo de Funcionalidades Transversais

| Funcionalidade | Onde aparece |
|----------------|-------------|
| Busca por texto (cidade/bairro) | Home, More |
| Filtros (preço, comodidades, distância) | More |
| Mapa interativo (Google Maps) | More, Place, Status-book, form-place |
| Geolocalização automática | Welcome, Home, More |
| Busca de CEP (ViaCEP) | form-place/address, profile/address |
| Upload de imagens (Firebase Storage) | form-place/images, profile/document |
| Chat em tempo real (Firebase Realtime DB) | conversations/chat |
| Formulários multi-step com progress bar | form-place, register, booking |
| Persistência em localStorage | form-place, booking |
| Cálculo dinâmico de preços | booking/calendar, hours, guests, confirm |
| Avaliações com estrelas | reservations, completed-booking, guest-profile |
| Toggle lessee/lessor | profile |
| Câmera do dispositivo | profile/document/picture |
| Gráficos de estatísticas | lessee/info-place |

---

## Mapa de Rotas — Complexidade

> Escala de 1 a 10 — quanto maior, mais cuidado e tempo necessários para desenvolver/alterar.

| Rota | Complexidade | Justificativa |
|------|:---:|---------------|
| `/welcome` | 3 | Geolocalização + redirect condicional por modo |
| `/notifications` | 2 | Apenas permissão de push + redirect |
| `/privacy` | 1 | Conteúdo estático + aceite |
| `/login` | 4 | OAuth Google, verificação de sessão, redirect pós-auth |
| `/manual-login` | 4 | Formulário de credenciais + validação |
| `/register` | 3 | Entrada do fluxo de cadastro |
| `/register/step-one` | 4 | Formulário com validação + persistência de estado |
| `/register/step-two` | 4 | Formulário com validação + persistência de estado |
| `/under-age` | 1 | Tela estática de bloqueio |
| `/private` (home) | 7 | Múltiplas queries paralelas, geolocalização, busca por texto, suspense, paginação por categoria |
| `/private/more` | 8 | Listagem + filtros dinâmicos + Google Maps + marcadores + geocodificação + toggle lista/mapa |
| `/private/place` | 6 | Detalhes completos do espaço, múltiplos dados aninhados, mapa |
| `/private/booking/calendar` | 8 | Calendário com dias desabilitados por disponibilidade, cálculo de preço em tempo real, lógica de desconto |
| `/private/booking/hours` | 7 | Seletor de horas com restrições dinâmicas, toggle dia inteiro, cálculo de preço |
| `/private/booking/guests` | 5 | Input numérico com limite dinâmico, cálculo de adicional |
| `/private/booking/confirm` | 9 | Cálculo completo de valores, seleção de cartão, integração de pagamento, envio para API, tratamento de erros |
| `/private/reservations` | 6 | Abas, listagem de reservas, modal de avaliação, múltiplos status |
| `/private/status-book/[uid]` | 6 | Detalhes dinâmicos por uid, mapa, ações condicionais por status |
| `/private/status-book/cancel` | 6 | Fluxo de cancelamento com política, motivo, confirmação e feedback |
| `/private/conversations` | 5 | Listagem de conversas com abas, avatar, prévia de mensagem |
| `/private/conversations/chat/[uid]` | 8 | Chat em tempo real (Firebase Realtime DB), histórico, envio, controle de estado aberto/fechado |
| `/private/lessee` | 2 | Redirect para my-place |
| `/private/lessee/my-place` | 5 | Listagem de espaços do usuário, ações CRUD, status |
| `/private/lessee/form-place/initial-info` | 5 | Selects dinâmicos com API, subcategoria dependente de categoria |
| `/private/lessee/form-place/address` | 7 | CEP → ViaCEP → preenchimento automático → número → Google Maps Geocoding → lat/lng |
| `/private/lessee/form-place/schedule` | 6 | Checkboxes de dias + HourPicker com horas desabilitadas dinamicamente |
| `/private/lessee/form-place/values` | 4 | Três inputs com máscara de moeda, todos obrigatórios |
| `/private/lessee/form-place/hour` | 5 | Switcher condicional que habilita/desabilita 3 campos dependentes |
| `/private/lessee/form-place/discount` | 4 | Switcher condicional com 2 campos dependentes |
| `/private/lessee/form-place/space-configs` | 5 | Inputs numéricos + ToggleList de comodidades com ícones via slug |
| `/private/lessee/form-place/rules` | 5 | Select de política → textarea somente leitura + 2 textareas obrigatórias |
| `/private/lessee/form-place/guests` | 3 | ToggleList de preferências, sem validação obrigatória |
| `/private/lessee/form-place/images` | 8 | Upload múltiplo, preview, Firebase Storage, criação/edição do place na API, tratamento de loading/erro |
| `/private/lessee/form-place/result` | 2 | Tela de sucesso, limpa localStorage |
| `/private/lessee/info-place/[uid]` | 6 | Gráficos de estatísticas, múltiplas queries, dados dos últimos 12 meses |
| `/private/lessee/schedule` | 7 | Calendário de reservas, seleção de data, listagem de hóspedes do dia, estatísticas |
| `/private/lessee/schedule/status-guest` | 5 | Detalhes de reserva + mapa + ações condicionais |
| `/private/lessee/approve-booking/[uid]` | 5 | Listagem filtrada por status PENDING, navegação para aprovação |
| `/private/lessee/approve-booking/approve/[uid]` | 7 | Exibe dados da reserva + hóspede, confirma ou nega, atualiza status via API |
| `/private/lessee/approve-booking/approve/confirmed` | 2 | Tela de feedback de sucesso |
| `/private/lessee/approve-booking/approve/deny` | 5 | Campo de motivo + confirmação + envio para API |
| `/private/lessee/completed-booking/[uid]` | 4 | Listagem filtrada por status COMPLETED |
| `/private/lessee/completed-booking/approve/[uid]` | 6 | Modal de avaliação com estrelas + comentário + envio para API |
| `/private/lessee/faq` | 2 | Cards expansíveis, conteúdo estático |
| `/private/profile/[uid]` | 6 | Dashboard com todos os dados do usuário, toggle de modo, links para edição, validação de completude |
| `/private/profile/name/[uid]` | 3 | Dois inputs + PATCH na API |
| `/private/profile/birthday/[uid]` | 4 | Máscara de data + validação de maioridade + redirect condicional |
| `/private/profile/address/[uid]` | 6 | Mesmo fluxo de CEP/ViaCEP do form-place |
| `/private/profile/document/[uid]` | 4 | Input com máscara CPF/CNPJ + navegação para captura |
| `/private/profile/document/confirm` | 2 | Tela informativa antes da câmera |
| `/private/profile/document/picture` | 8 | Acesso à câmera, captura frente/verso, preview, retomada, upload Firebase Storage |
| `/private/profile/payment-method` | 5 | Listagem de cartões, definir padrão, deletar |
| `/private/profile/payment-method/create` | 6 | Formulário de cartão com validação completa + POST na API |
| `/private/profile/payment-method/edit` | 6 | Carrega dados existentes + PATCH na API |
| `/private/profile/receiver-method/[uid]` | 7 | Formulário bancário completo (banco, tipo, agência, conta, dígitos, CPF/CNPJ) + validação + API |
| `/private/profile/guest-profile/[uid]` | 4 | Perfil público com avaliações, dados carregados por uid |


