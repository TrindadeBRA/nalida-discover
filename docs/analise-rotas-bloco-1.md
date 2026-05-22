# Análise de Rotas — Bloco 1: Rotas Públicas e Autenticação

> Documento gerado com base nos screenshots capturados em `docs/screenshots/bloco-1/` e nos documentos de requisitos existentes.
> Viewport de captura: **390 × 844px** (mobile — iPhone 14 Pro)

---

## Visão Geral

O bloco 1 cobre todas as rotas acessíveis **antes** de o usuário estar autenticado, mais as telas de onboarding que aparecem logo após o primeiro login. São 10 telas no total, divididas em dois grupos:

| Grupo | Rotas |
|-------|-------|
| **Autenticação** | `/login`, `/manual-login`, `/register`, `/register/step-one`, `/register/step-two`, `/under-age` |
| **Onboarding pós-login** | `/welcome`, `/privacy`, `/notifications` |

---

## Rotas Públicas (sem autenticação)

### `/login`

<img src="./screenshots/bloco-1/login.png" alt="login" height="400" />

**Descrição**
Tela de entrada principal da plataforma. Ponto de acesso para todos os usuários.

**Funcionalidades visíveis**
- Botão "Entrar com Google" — método principal e único ativo
- Link para `/manual-login` (login com e-mail e senha)
- Placeholders comentados para Apple e Facebook (não renderizados)
- Verificação de sessão ativa: se o usuário já tem cookie válido, é redirecionado automaticamente para `/private` ou `/private/lessee`

**Fluxo de saída**
- Login com Google → `/welcome`
- Link "Entrar com e-mail" → `/manual-login`
- Sessão ativa detectada → `/private`

**Status de implementação:** ✅ Completo (Google OAuth funcional)

**Observações**
- Apple e Facebook estão comentados no código — botões não aparecem na UI
- Sem opção de "Esqueci minha senha" visível nesta tela

---

### `/manual-login`

<img src="./screenshots/bloco-1/manual-login.png" alt="manual-login" height="400" />

**Descrição**
Formulário de login tradicional com e-mail e senha cadastrados no Firebase Auth.

**Funcionalidades visíveis**
- Campo de e-mail
- Campo de senha (com toggle de visibilidade)
- Botão "Entrar"
- Link de retorno para `/login`

**Fluxo de saída**
- Credenciais válidas → Firebase Auth → `POST /auth/login` → `/welcome`
- Credenciais inválidas → mensagem de erro inline

**Status de implementação:** ⚠️ Parcial

**Observações**
- Funciona para usuários já criados no Firebase Auth
- Não há endpoint de cadastro por e-mail/senha no backend — o usuário precisa ter sido criado via fluxo `/register` ou Firebase Console
- Sem "Esqueci minha senha" implementado

---

### `/register`

<img src="./screenshots/bloco-1/register.png" alt="register" height="400" />

**Descrição**
Tela de entrada do fluxo de cadastro. Funciona como redirect para `/register/step-one`.

**Funcionalidades visíveis**
- Apresentação do fluxo de cadastro
- Botão para iniciar o cadastro
- Link de retorno para `/login`

**Fluxo de saída**
- Avançar → `/register/step-one`

**Status de implementação:** ✅ Completo (apenas redirect)

---

### `/register/step-one`

<img src="./screenshots/bloco-1/register-step-one.png" alt="register-step-one" height="400" />

**Descrição**
Primeira etapa do cadastro: coleta e-mail e senha para criar a conta no Firebase Auth.

**Funcionalidades visíveis**
- Campo de e-mail
- Campo de senha
- Campo de confirmação de senha
- Indicador de progresso (etapa 1 de 2)
- Botão "Avançar"

**Fluxo de saída**
- Dados válidos → `createUserWithEmailAndPassword` no Firebase → `/register/step-two`
- Dados inválidos → validação inline

**Status de implementação:** ⚠️ Parcial

**Observações**
- Conta é criada no Firebase Auth nesta etapa
- Nome e data de nascimento (coletados no step 2) **não são enviados ao backend** — o upsert usa apenas os dados do Firebase (`displayName`, `email`)

---

### `/register/step-two`

<img src="./screenshots/bloco-1/register-step-two.png" alt="register-step-two" height="400" />

**Descrição**
Segunda etapa do cadastro: coleta nome completo e data de nascimento.

**Funcionalidades visíveis**
- Campo de nome
- Campo de sobrenome
- Campo de data de nascimento (com máscara DD/MM/YYYY)
- Indicador de progresso (etapa 2 de 2)
- Botão "Concluir"

**Fluxo de saída**
- Idade ≥ 18 anos → `POST /auth/login` → `/welcome`
- Idade < 18 anos → `/under-age`

**Status de implementação:** ⚠️ Parcial

**Observações**
- Validação de maioridade ocorre **apenas no frontend**
- Nome e data de nascimento preenchidos aqui **não são persistidos no backend** — lacuna conhecida

---

### `/under-age`

<img src="./screenshots/bloco-1/under-age.png" alt="under-age" height="400" />

**Descrição**
Tela de bloqueio exibida quando o usuário informa data de nascimento que indica menos de 18 anos.

**Funcionalidades visíveis**
- Mensagem de bloqueio
- Sem botão de retorno ou alternativa de acesso

**Fluxo de saída**
- Nenhum — tela terminal

**Status de implementação:** ⚠️ Parcial

**Observações**
- Validação apenas no frontend — o backend não armazena data de nascimento nem bloqueia a conta por idade
- Usuário pode contornar acessando `/login` diretamente

---

## Rotas de Onboarding (pós-autenticação, pré-dashboard)

> Estas rotas aparecem logo após o primeiro login. Tecnicamente exigem sessão ativa, mas fazem parte do fluxo de entrada do usuário novo.

---

### `/welcome`

<img src="./screenshots/bloco-1/welcome.png" alt="welcome" height="400" />

**Descrição**
Primeira tela após o login. Solicita permissão de geolocalização e direciona o usuário para o dashboard correto.

**Funcionalidades visíveis**
- Mensagem de boas-vindas com nome do usuário
- Botão "Permitir localização" — aciona o prompt nativo do navegador
- Botão "Avançar" — disponível após interação com geolocalização

**Fluxo de saída**
- Modo lessor ativo → `/private` (dashboard de busca)
- Modo lessee ativo → `/private/lessee` (dashboard do proprietário)

**Status de implementação:** ⚠️ Parcial

**Observações**
- Coordenadas são salvas apenas em memória (`LocationProvider`) — não persistidas no perfil do usuário no backend
- Se o usuário negar a permissão, a busca por proximidade não funciona

---

### `/privacy`

<img src="./screenshots/bloco-1/privacy.png" alt="privacy" height="400" />

**Descrição**
Exibe os termos de privacidade da plataforma e registra o aceite do usuário.

**Funcionalidades visíveis**
- Texto completo dos termos de privacidade (scrollável)
- Botão "Aceitar"

**Fluxo de saída**
- Aceitar → flag `privacyAccepted: true` no contexto global → continua o fluxo de onboarding

**Status de implementação:** ⚠️ Parcial

**Observações**
- Aceite registrado apenas em memória — sem campo `acceptedTermsAt` no banco de dados
- Não é auditável nem rastreável por usuário

---

### `/notifications`

<img src="./screenshots/bloco-1/notifications.png" alt="notifications" height="400" />

**Descrição**
Solicita autorização do navegador para envio de notificações push.

**Funcionalidades visíveis**
- Explicação sobre o uso das notificações
- Botão "Autorizar notificações"

**Fluxo de saída**
- Clicar no botão → prompt nativo do navegador (sem efeito real atualmente)

**Status de implementação:** ❌ Ausente

**Observações**
- Tela construída e botão visível, mas sem integração com Firebase Cloud Messaging
- Não há endpoint no backend para registrar o token do dispositivo
- Clicar em "Autorizar" não produz nenhum efeito funcional

---

## Mapa de Fluxo — Bloco 1

```
[Acesso inicial]
      │
      ▼
   /login ──────────────────────────────────────────────────────┐
      │                                                          │
      ├── Google OAuth ──────────────────────────────────────── │
      │                                                          │
      ├── "Entrar com e-mail" ──► /manual-login                 │
      │         │                      │                         │
      │         │              credenciais válidas               │
      │         │                      │                         │
      └── "Cadastrar" ──► /register ──► /register/step-one      │
                                              │                  │
                                    /register/step-two           │
                                         │        │              │
                                    idade ≥ 18   < 18            │
                                         │        │              │
                                         │   /under-age          │
                                         │   (terminal)          │
                                         │                       │
                              ◄──────────┘◄──────────────────────┘
                              POST /auth/login
                                         │
                                         ▼
                                     /welcome
                                         │
                                    (geolocalização)
                                         │
                                     /privacy
                                         │
                                  /notifications
                                         │
                              ┌──────────┴──────────┐
                              ▼                     ▼
                          /private          /private/lessee
                       (modo lessor)       (modo lessee)
```

---

## Resumo de Status por Rota

| Rota | Status | Lacunas principais |
|------|:------:|-------------------|
| `/login` | ✅ | Apple e Facebook não implementados |
| `/manual-login` | ⚠️ | Sem "Esqueci minha senha"; depende de conta pré-existente |
| `/register` | ✅ | — |
| `/register/step-one` | ⚠️ | — |
| `/register/step-two` | ⚠️ | Nome e data de nascimento não persistidos no backend |
| `/under-age` | ⚠️ | Validação apenas no frontend; contornável |
| `/welcome` | ⚠️ | Geolocalização não persistida no backend |
| `/privacy` | ⚠️ | Aceite não auditável — sem campo no banco |
| `/notifications` | ❌ | Sem integração FCM; botão sem efeito |

---

## Funcionalidades Transversais do Bloco

| Funcionalidade | Onde aparece | Status |
|----------------|-------------|:------:|
| Firebase Auth (Google OAuth) | `/login` | ✅ |
| Firebase Auth (e-mail/senha) | `/manual-login`, `/register/step-one` | ⚠️ |
| Verificação de sessão ativa + redirect | `/login` | ✅ |
| Validação de maioridade | `/register/step-two` | ⚠️ (só frontend) |
| Geolocalização do navegador | `/welcome` | ⚠️ (só memória) |
| Aceite de termos | `/privacy` | ⚠️ (só memória) |
| Push notifications (FCM) | `/notifications` | ❌ |
| Renovação automática de token (refresh) | Transversal | ❌ |

---

## Próximos Blocos

| Bloco | Título | Screenshots |
|-------|--------|-------------|
| Bloco 2 | Home lessor (dashboard e espaços) | `private-home`, `private-more`, `private-place` |
| Bloco 3 | Fluxo de reserva (lessor) | `booking-calendar`, `booking-hours`, `booking-guests`, `booking-confirm`, `reservations`, `status-book-detail`, `status-book-cancel` |
| Bloco 4 | — | — |
| Bloco 5 | — | — |
| Bloco 6 | — | — |
| Bloco 7 | — | — |
