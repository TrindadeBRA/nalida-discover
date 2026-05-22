# Análise de Rotas — Bloco 7: Perfil do Usuário

> Documento gerado com base nos screenshots capturados em `docs/screenshots/bloco-7/` e nos documentos de requisitos existentes.
> Viewport de captura: **390 × 844px** (mobile — iPhone 14 Pro)

---

## Visão Geral

O bloco 7 cobre todas as telas de perfil do usuário: visualização, edição de dados pessoais, verificação de documento, métodos de pagamento, dados bancários e perfil público de hóspede. São 12 telas organizadas em quatro sub-fluxos:

| Sub-fluxo | Rotas |
|-----------|-------|
| **Perfil principal** | `/private/profile/[uid]` |
| **Dados pessoais** | `profile/name`, `profile/birthday`, `profile/address` |
| **Verificação de documento** | `profile/document/[uid]`, `document/confirm`, `document/picture` |
| **Pagamento e recebimento** | `profile/payment-method`, `payment-method/create`, `payment-method/edit`, `profile/receiver-method/[uid]` |
| **Perfil público** | `profile/guest-profile/[uid]` |

---

## Sub-fluxo: Perfil Principal

### `/private/profile/[uid]`

<img src="./screenshots/bloco-7/profile.png" alt="profile" height="400" />

**Descrição**
Dashboard central do perfil. Agrega todos os dados do usuário com links de edição para cada seção.

**Funcionalidades visíveis**
- Avatar, nome e e-mail do usuário
- Seção dados pessoais: nome, e-mail, data de nascimento, telefone, documento, endereço
- Seção dados bancários: conta para recebimento de pagamentos
- Seção métodos de pagamento: cartões cadastrados
- Toggle para alternar entre modo lessor/lessee
- Links de edição para cada campo/seção
- Indicador de completude do perfil

**Fluxo de saída**
- Editar nome → `/private/profile/name/[uid]`
- Editar data de nascimento → `/private/profile/birthday/[uid]`
- Editar endereço → `/private/profile/address/[uid]`
- Verificar documento → `/private/profile/document/[uid]`
- Métodos de pagamento → `/private/profile/payment-method`
- Dados bancários → `/private/profile/receiver-method/[uid]`

**Dependências de dados**
- `GET /user/:uid` — todos os dados do usuário

**Status de implementação:** ✅ Completo

---

## Sub-fluxo: Dados Pessoais

### `/private/profile/name/[uid]`

<img src="./screenshots/bloco-7/profile-name.png" alt="profile-name" height="400" />

**Descrição**
Edição de nome e sobrenome do usuário.

**Funcionalidades visíveis**
- Campo de nome (obrigatório)
- Campo de sobrenome (obrigatório)
- Botão "Salvar" → `PATCH /user`

**Status de implementação:** ✅ Completo

---

### `/private/profile/birthday/[uid]`

<img src="./screenshots/bloco-7/profile-birthday.png" alt="profile-birthday" height="400" />

**Descrição**
Edição de data de nascimento com validação de maioridade.

**Funcionalidades visíveis**
- Campo de data com máscara DD/MM/YYYY
- Botão "Salvar"

**Fluxo de saída**
- Idade ≥ 18 → `PATCH /user` → `/private/profile/[uid]`
- Idade < 18 → `/under-age`

**Status de implementação:** ✅ Completo

**Observações**
- Mesma validação de maioridade do cadastro — apenas no frontend

---

### `/private/profile/address/[uid]`

<img src="./screenshots/bloco-7/profile-address.png" alt="profile-address" height="400" />

**Descrição**
Edição de endereço residencial com busca automática por CEP.

**Funcionalidades visíveis**
- Campo de CEP com máscara — ao completar 8 dígitos consulta ViaCEP automaticamente
- Estado, Cidade, Bairro, Rua — preenchidos automaticamente; desabilitados
- Campo de número (manual)
- Campo de complemento (opcional)
- Botão "Salvar" → `PATCH /user`

**Status de implementação:** ✅ Completo

**Observações**
- Mesmo fluxo de CEP do `form-place/address` — sem geocodificação nesta tela

---

## Sub-fluxo: Verificação de Documento

### `/private/profile/document/[uid]`

<img src="./screenshots/bloco-7/profile-document.png" alt="profile-document" height="400" />

**Descrição**
Entrada do fluxo de verificação de identidade. Coleta o número do documento (CPF ou CNPJ).

**Funcionalidades visíveis**
- Campo de documento com máscara CPF/CNPJ
- Botão "Avançar" → `/private/profile/document/confirm`

**Status de implementação:** ✅ Completo

---

### `/private/profile/document/confirm`

<img src="./screenshots/bloco-7/profile-document-confirm.png" alt="profile-document-confirm" height="400" />

**Descrição**
Tela informativa antes da captura do documento. Orienta o usuário sobre o processo.

**Funcionalidades visíveis**
- Instruções sobre como fotografar o documento
- Botão "Continuar" → `/private/profile/document/picture`

**Status de implementação:** ✅ Completo

---

### `/private/profile/document/picture`

<img src="./screenshots/bloco-7/profile-document-picture.png" alt="profile-document-picture" height="400" />

**Descrição**
Captura de frente e verso do documento via câmera do dispositivo.

**Funcionalidades visíveis**
- Acesso à câmera do dispositivo (API nativa)
- Captura de frente do documento
- Captura de verso do documento
- Preview de cada foto com opção de repetir
- Botão "Confirmar" → upload para Firebase Storage → `PATCH /user`

**Dependências de dados**
- Firebase Storage — upload das imagens do documento
- `PATCH /user` com URLs das imagens

**Status de implementação:** ✅ Completo

**Observações**
- Tela de maior complexidade do bloco — acesso à câmera, captura dupla, preview e upload
- Sem validação automática do documento (OCR ou verificação de identidade)
- Verificação é manual — sem integração com serviço de KYC

---

## Sub-fluxo: Pagamento e Recebimento

### `/private/profile/payment-method`

<img src="./screenshots/bloco-7/profile-payment-method.png" alt="profile-payment-method" height="400" />

**Descrição**
Lista de cartões de crédito cadastrados pelo usuário para uso nas reservas.

**Funcionalidades visíveis**
- Cards de cartões com bandeira, últimos 4 dígitos e nome do titular
- Badge "Padrão" no cartão principal
- Ações por cartão: editar, deletar, definir como padrão
- Botão "Adicionar cartão" → `/private/profile/payment-method/create`

**Dependências de dados**
- `GET /user/:uid` — inclui `paymentMethods`
- `DELETE /payment-method/:uid` — remover cartão
- `PATCH /payment-method/:uid` — definir como padrão

**Status de implementação:** ✅ Completo

---

### `/private/profile/payment-method/create`

<img src="./screenshots/bloco-7/profile-payment-create.png" alt="profile-payment-create" height="400" />

**Descrição**
Formulário de cadastro de novo cartão de crédito.

**Funcionalidades visíveis**
- Número do cartão (com máscara e detecção de bandeira)
- Nome do titular
- Data de validade (MM/AA)
- CVV
- Checkbox "Definir como padrão"
- Botão "Salvar" → `POST /payment-method`

**Status de implementação:** ✅ Completo

**Observações**
- Dados do cartão armazenados diretamente — sem tokenização via gateway (risco de segurança)

---

### `/private/profile/payment-method/edit`

<img src="./screenshots/bloco-7/profile-payment-edit.png" alt="profile-payment-edit" height="400" />

**Descrição**
Edição de cartão de crédito existente.

**Funcionalidades visíveis**
- Mesmos campos do formulário de criação, pré-preenchidos
- Checkbox "Definir como padrão"
- Botão "Salvar" → `PATCH /payment-method/:uid`

**Status de implementação:** ✅ Completo

---

### `/private/profile/receiver-method/[uid]`

<img src="./screenshots/bloco-7/profile-receiver-method.png" alt="profile-receiver-method" height="400" />

**Descrição**
Cadastro de dados bancários para recebimento de pagamentos das reservas.

**Funcionalidades visíveis**
- Seleção de banco (lista completa de bancos brasileiros)
- Tipo de conta: corrente, poupança ou pagamento
- CPF ou CNPJ do titular
- Razão social / nome
- Agência (com dígito)
- Conta (com dígito)
- Botão "Salvar" → `PATCH /user`

**Status de implementação:** ✅ Completo

**Observações**
- Dados bancários armazenados sem integração com gateway de pagamento
- Sem validação de conta bancária real (ex: via Pix ou Open Finance)

---

## Sub-fluxo: Perfil Público

### `/private/profile/guest-profile/[uid]`

<img src="./screenshots/bloco-7/profile-guest-profile.png" alt="profile-guest-profile" height="400" />

**Descrição**
Perfil público de um hóspede, acessível por proprietários durante o processo de aprovação de reserva.

**Funcionalidades visíveis**
- Avatar, nome e bio do hóspede
- Data de entrada na plataforma ("membro desde")
- Avaliações recebidas de anfitriões anteriores: estrelas + comentário por avaliação
- Média geral de avaliações

**Dependências de dados**
- `GET /user/:uid` — dados públicos do hóspede
- `GET /rating?where[targetUid]=:uid` — avaliações recebidas

**Status de implementação:** ✅ Completo

---

## Mapa de Fluxo — Bloco 7

```
[/private/profile/[uid]]
        │
   ┌────┼────────────────────────────────────┐
   │    │                                    │
"nome" "endereço"                     "documento"
   │    │                                    │
name  address                         document/[uid]
   │    │                                    │
PATCH  PATCH                          document/confirm
                                            │
                                      document/picture
                                            │
                                      Firebase Storage
                                      + PATCH /user

[/private/profile/[uid]]
        │
   ┌────┴──────────────────┐
   │                       │
"pagamento"           "recebimento"
   │                       │
payment-method        receiver-method/[uid]
   │                  PATCH /user
   ├── create ──► POST /payment-method
   └── edit   ──► PATCH /payment-method/:uid
```

---

## Resumo de Status por Rota

| Rota | Status | Lacunas principais |
|------|:------:|-------------------|
| `/private/profile/[uid]` | ✅ | — |
| `profile/name/[uid]` | ✅ | — |
| `profile/birthday/[uid]` | ✅ | Validação de maioridade só no frontend |
| `profile/address/[uid]` | ✅ | — |
| `profile/document/[uid]` | ✅ | — |
| `profile/document/confirm` | ✅ | — |
| `profile/document/picture` | ✅ | Sem KYC/OCR; verificação manual |
| `profile/payment-method` | ✅ | — |
| `profile/payment-method/create` | ✅ | Dados sem tokenização via gateway |
| `profile/payment-method/edit` | ✅ | — |
| `profile/receiver-method/[uid]` | ✅ | Sem validação de conta bancária real |
| `profile/guest-profile/[uid]` | ✅ | — |

---

## Funcionalidades Transversais do Bloco

| Funcionalidade | Status |
|----------------|:------:|
| Edição de dados pessoais via `PATCH /user` | ✅ |
| Busca de CEP (ViaCEP) | ✅ |
| Captura via câmera do dispositivo | ✅ |
| Upload de documento (Firebase Storage) | ✅ |
| Verificação de identidade (KYC/OCR) | ❌ |
| Tokenização de cartão via gateway | ❌ |
| Validação de conta bancária | ❌ |
| Toggle lessor/lessee | ✅ |

---

## Navegação entre Blocos

| Bloco | Título | Entrada via |
|-------|--------|-------------|
| ← Qualquer bloco | — | Ícone de perfil na navbar inferior |
| ↔ Bloco 3 | Fluxo de reserva | Cartões cadastrados aqui são usados em `booking/confirm` |
| ↔ Bloco 6 | Gestão de reservas | `guest-profile` acessado a partir de `approve-booking/approve/[uid]` |
