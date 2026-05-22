# placeholder

# Relatório de Funcionalidades — Nalida Web

**Produto:** Nalida — Plataforma de Aluguel de Espaços Comerciais
**Data:** 22 de maio de 2026
**Elaborado por:** TrinityWeb

---

## Legenda

| Símbolo | Significado |
|:-------:|-------------|
| ✅ | Implementado e funcional |
| ⚠️ | Existe, mas incompleto ou desconectado |
| ❌ | Não implementado |

> Cada funcionalidade é avaliada de forma independente no **frontend** (interface e experiência do usuário) e no **backend** (lógica de negócio, persistência e integrações). O status final reflete o cruzamento das duas camadas.

---

## 1. Autenticação e Acesso

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 1.1 | Login com Google (OAuth) | ✅ | ✅ | ✅ Completo |
| 1.2 | Login com e-mail e senha | ✅ | ⚠️ | ⚠️ Parcial |
| 1.3 | Login com Apple | ❌ | ❌ | ❌ Ausente |
| 1.4 | Login com Facebook | ❌ | ❌ | ❌ Ausente |
| 1.5 | Cadastro de novo usuário (e-mail + dados pessoais) | ✅ | ⚠️ | ⚠️ Parcial |
| 1.6 | Logout e encerramento de sessão | ✅ | ✅ | ✅ Completo |
| 1.7 | Renovação automática de token (refresh) | ❌ | ⚠️ | ⚠️ Parcial |
| 1.8 | Bloqueio de acesso para menores de 18 anos | ✅ | ❌ | ⚠️ Parcial |
| 1.9 | Proteção de rotas autenticadas | ✅ | ✅ | ✅ Completo |

**Observações**
- **1.2** — Backend processa apenas tokens Firebase; não há endpoint de autenticação direta por credenciais.
- **1.5** — Nome e data de nascimento preenchidos no cadastro não são persistidos no backend.
- **1.7** — `refreshToken` existe no banco, mas sem endpoint `/auth/refresh`. Expiração força logout.
- **1.8** — Validação apenas no frontend; contornável acessando `/login` diretamente.

---

## 2. Onboarding

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 2.1 | Captura de geolocalização inicial | ✅ | ❌ | ⚠️ Parcial |
| 2.2 | Aceite dos termos de privacidade | ✅ | ❌ | ⚠️ Parcial |
| 2.3 | Solicitação de permissão para notificações push | ✅ | ❌ | ❌ Ausente |

**Observações**
- **2.1 / 2.2** — Telas existem e guiam o usuário, mas as respostas ficam apenas em memória (contexto React). Sem persistência no banco.
- **2.3** — Tela construída, botão visível, sem integração com FCM. Clicar não produz efeito.

---

## 3. Busca e Descoberta de Espaços

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 3.1 | Listagem de espaços por categoria e proximidade | ✅ | ✅ | ✅ Completo |
| 3.2 | Busca por texto (cidade ou bairro) | ✅ | ⚠️ | ⚠️ Parcial |
| 3.3 | Filtros de preço, comodidades e distância | ✅ | ⚠️ | ⚠️ Parcial |
| 3.4 | Visualização em mapa com marcadores (Google Maps) | ✅ | ✅ | ✅ Completo |
| 3.5 | Detalhe completo do espaço | ✅ | ✅ | ✅ Completo |
| 3.6 | Paginação de resultados | ✅ | ✅ | ✅ Completo |
| 3.7 | Avaliação média do espaço | ✅ | ✅ | ✅ Completo |

**Observações**
- **3.2** — Backend aceita parâmetros de busca, mas sem full-text search. Apenas correspondência exata de campo.
- **3.3** — Filtros de preço e distância processados no cliente; backend não tem operadores de range nativos.

---

## 4. Fluxo de Reserva — Locatário

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 4.1 | Seleção de datas | ✅ | ✅ | ✅ Completo |
| 4.2 | Seleção de horário de entrada e saída | ✅ | ✅ | ✅ Completo |
| 4.3 | Verificação de disponibilidade em tempo real | ✅ | ✅ | ✅ Completo |
| 4.4 | Seleção de hóspedes adicionais | ✅ | ✅ | ✅ Completo |
| 4.5 | Cálculo e exibição do valor total | ✅ | ⚠️ | ⚠️ Parcial |
| 4.6 | Criação da reserva | ✅ | ✅ | ✅ Completo |
| 4.7 | **Processamento do pagamento** | ✅ | ❌ | ❌ Ausente |
| 4.8 | Confirmação pós-reserva (feedback ao usuário) | ✅ | ⚠️ | ⚠️ Parcial |
| 4.9 | Acompanhamento do status da reserva | ✅ | ✅ | ✅ Completo |
| 4.10 | Cancelamento de reserva pelo locatário | ✅ | ⚠️ | ⚠️ Parcial |

**Observações**
- **4.5** — Valor calculado exclusivamente no frontend e enviado ao backend sem recálculo. Vulnerabilidade de manipulação.
- **4.7** — **Gap crítico.** Toda a UI de pagamento é funcional visualmente, mas nenhuma cobrança é executada. O método de processamento está completamente desativado no código.
- **4.8** — Tela de sucesso exibida, mas sem envio de confirmação por e-mail, push ou mensagem.
- **4.10** — Status atualizado via API, mas sem aplicação de política de cancelamento (prazo, multa, reembolso).

---

## 5. Histórico de Reservas — Locatário

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 5.1 | Lista de reservas (ativas, inativas, anteriores) | ✅ | ✅ | ✅ Completo |
| 5.2 | Avaliação do espaço após reserva concluída | ✅ | ✅ | ✅ Completo |
| 5.3 | Avaliação do proprietário após reserva | ❌ | ✅ | ⚠️ Parcial |

**Observações**
- **5.3** — Backend suporta `ratingType: owner`, mas não há tela de avaliação do proprietário no frontend.

---

## 6. Cadastro de Espaço — Proprietário

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 6.1 | Informações gerais (título, tipo, categoria, subcategoria) | ✅ | ✅ | ✅ Completo |
| 6.2 | Endereço com consulta automática por CEP | ✅ | ✅ | ✅ Completo |
| 6.3 | Configurações físicas (capacidade, banheiros, m², internet) | ✅ | ✅ | ✅ Completo |
| 6.4 | Valores (diária, hora, taxa de limpeza, hóspede adicional) | ✅ | ✅ | ✅ Completo |
| 6.5 | Desconto para estadias longas | ✅ | ✅ | ✅ Completo |
| 6.6 | Disponibilidade e horários de funcionamento | ✅ | ✅ | ✅ Completo |
| 6.7 | Seleção de comodidades | ✅ | ✅ | ✅ Completo |
| 6.8 | Regras do espaço e instruções de check-in | ✅ | ✅ | ✅ Completo |
| 6.9 | Política de cancelamento | ✅ | ✅ | ✅ Completo |
| 6.10 | Preferências de hóspedes | ✅ | ✅ | ✅ Completo |
| 6.11 | Upload de fotos do espaço | ✅ | ⚠️ | ⚠️ Parcial |
| 6.12 | Publicação e ativação do espaço | ✅ | ⚠️ | ⚠️ Parcial |

**Observações**
- **6.11** — Imagens enviadas ao Firebase Storage via frontend; backend armazena apenas a URL sem validar formato, tamanho ou quantidade. Sem moderação de conteúdo.
- **6.12** — Espaço criado e imediatamente visível na plataforma. Sem fluxo de revisão ou aprovação prévia.

---

## 7. Painel do Proprietário — Gestão de Reservas

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 7.1 | Lista de espaços cadastrados | ✅ | ✅ | ✅ Completo |
| 7.2 | Reservas pendentes de aprovação | ✅ | ✅ | ✅ Completo |
| 7.3 | Aprovar reserva | ✅ | ✅ | ✅ Completo |
| 7.4 | Negar reserva com motivo | ✅ | ✅ | ✅ Completo |
| 7.5 | Reservas concluídas | ✅ | ✅ | ✅ Completo |
| 7.6 | Avaliação do hóspede após reserva concluída | ✅ | ✅ | ✅ Completo |
| 7.7 | Agenda visual do espaço (calendário) | ✅ | ⚠️ | ⚠️ Parcial |
| 7.8 | Acompanhamento de presença do hóspede (check-in/out) | ✅ | ⚠️ | ⚠️ Parcial |

**Observações**
- **7.7** — Agenda renderizada a partir de consultas genéricas de bookings. Sem endpoint dedicado de calendário.
- **7.8** — Tela existe, mas backend não possui campos de presença confirmada pelo proprietário.

---

## 8. Dashboard e Métricas do Proprietário

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 8.1 | Quantidade de reservas por mês (últimos 6 meses) | ✅ | ✅ | ✅ Completo |
| 8.2 | Faturamento mensal (últimos 6 meses) | ✅ | ✅ | ✅ Completo |
| 8.3 | Quantidade de hóspedes por mês | ✅ | ✅ | ✅ Completo |
| 8.4 | Gráficos de evolução temporal | ✅ | ✅ | ✅ Completo |
| 8.5 | Taxa de ocupação do espaço | ❌ | ❌ | ❌ Ausente |
| 8.6 | Receita acumulada no ano (YTD) | ❌ | ❌ | ❌ Ausente |
| 8.7 | Ranking de horários mais reservados | ❌ | ❌ | ❌ Ausente |

**Observações**
- **8.1–8.4** — Funcionais e conectados. Dados calculados diretamente das reservas no banco.
- **8.5–8.7** — Métricas de inteligência de negócio não existem em nenhuma camada.

---

## 9. Chat e Mensagens

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 9.1 | Lista de conversas (abertas e fechadas) | ✅ | ❌ | ⚠️ Parcial |
| 9.2 | Envio e recebimento de mensagens em tempo real | ✅ | ❌ | ⚠️ Parcial |
| 9.3 | Histórico de mensagens persistido | ✅ | ❌ | ⚠️ Parcial |
| 9.4 | Notificação de nova mensagem | ❌ | ❌ | ❌ Ausente |

**Observações**
- **9.1–9.3** — Chat funciona via Firebase Realtime Database, sem passar pela API principal. Operacional, mas desacoplado do restante do sistema. Histórico não sincronizado com MongoDB.
- **9.4** — Sem push notification, badge de contador ou e-mail para mensagens recebidas.

---

## 10. Perfil do Usuário

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 10.1 | Visualizar perfil próprio | ✅ | ✅ | ✅ Completo |
| 10.2 | Editar nome | ✅ | ✅ | ✅ Completo |
| 10.3 | Editar data de nascimento | ✅ | ⚠️ | ⚠️ Parcial |
| 10.4 | Gerenciar endereços | ✅ | ✅ | ✅ Completo |
| 10.5 | Adicionar cartão de crédito | ✅ | ✅ | ✅ Completo |
| 10.6 | Remover cartão de crédito | ✅ | ✅ | ✅ Completo |
| 10.7 | Cadastrar conta bancária para recebimento | ✅ | ⚠️ | ⚠️ Parcial |
| 10.8 | Verificação de identidade (documento + câmera) | ✅ | ❌ | ❌ Ausente |
| 10.9 | Visualizar perfil público de outro usuário | ✅ | ✅ | ✅ Completo |
| 10.10 | Alternância entre modo cliente e host | ✅ | ✅ | ✅ Completo |

**Observações**
- **10.5** — Dados do cartão encriptados no backend antes de armazenar. Boa prática implementada corretamente.
- **10.7** — Campo de conta bancária existe no banco, mas sem validação real nem integração com gateway para split de repasse.
- **10.8** — Frontend tem fluxo completo com câmera e upload. Backend não processa as imagens — sem integração com serviço de KYC.

---

## 11. Avaliações

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 11.1 | Exibir nota média do espaço | ✅ | ✅ | ✅ Completo |
| 11.2 | Submeter avaliação do espaço | ✅ | ✅ | ✅ Completo |
| 11.3 | Listar avaliações na página do espaço | ❌ | ✅ | ⚠️ Parcial |
| 11.4 | Avaliar o proprietário após a estadia | ❌ | ✅ | ⚠️ Parcial |
| 11.5 | Avaliar o locatário após a estadia | ✅ | ✅ | ✅ Completo |

**Observações**
- **11.3 / 11.4** — Backend completo com suporte a avaliações de espaços, locatários e proprietários. Frontend não possui tela de listagem de reviews nem avaliação do proprietário.

---

## 12. Notificações

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 12.1 | Push: reserva aprovada | ❌ | ❌ | ❌ Ausente |
| 12.2 | Push: nova reserva pendente (proprietário) | ❌ | ❌ | ❌ Ausente |
| 12.3 | Push: nova mensagem no chat | ❌ | ❌ | ❌ Ausente |
| 12.4 | E-mail: confirmação de reserva | ❌ | ❌ | ❌ Ausente |
| 12.5 | E-mail: boas-vindas pós-cadastro | ❌ | ❌ | ❌ Ausente |
| 12.6 | E-mail: lembrete 24h antes do check-in | ❌ | ❌ | ❌ Ausente |

**Observações**
- Nenhuma forma de comunicação proativa com o usuário está implementada em nenhuma das camadas. Este bloco representa risco direto à experiência do usuário e ao índice de conversão de reservas.

---

## 13. Pagamento

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 13.1 | Cadastrar cartão de crédito | ✅ | ✅ | ✅ Completo |
| 13.2 | Listar e selecionar forma de pagamento | ✅ | ✅ | ✅ Completo |
| 13.3 | **Processar cobrança no momento da reserva** | ✅ | ❌ | ❌ Ausente |
| 13.4 | Webhook de confirmação do gateway | ❌ | ❌ | ❌ Ausente |
| 13.5 | Repasse ao proprietário (split de pagamento) | ❌ | ❌ | ❌ Ausente |
| 13.6 | Reembolso em cancelamentos | ❌ | ❌ | ❌ Ausente |
| 13.7 | Histórico de transações | ❌ | ❌ | ❌ Ausente |
| 13.8 | Recibo / comprovante de pagamento | ❌ | ❌ | ❌ Ausente |

**Observações**
- **13.3** — **Gap crítico.** O backend possui campos de infraestrutura (`acquirerOrderUid`, `paymentStatus`) e endpoint de webhook, mas todo o código de processamento está comentado. Nenhum gateway está integrado. O produto aceita reservas, mas **não realiza nenhuma transação financeira real**.
- **13.5** — `receiverMethods` no perfil do usuário foi desenhado para o split, mas sem gateway é inoperante.

---

## 14. App Mobile

| # | Funcionalidade | Frontend | Backend | Status |
|---|----------------|:--------:|:-------:|:------:|
| 14.1 | Telas nativas próprias | ❌ | — | ❌ Ausente |
| 14.2 | Carregamento da versão web via WebView | ✅ | — | ⚠️ Parcial |
| 14.3 | Builds automatizados via EAS (Expo) | ✅ | — | ✅ Completo |
| 14.4 | Geolocalização nativa | ⚠️ | — | ⚠️ Parcial |
| 14.5 | Câmera nativa | ⚠️ | — | ⚠️ Parcial |

**Observações**
- O app mobile é integralmente um wrapper WebView que carrega a versão web. Não existem telas, navegação ou componentes nativos desenvolvidos. Publicar nas lojas no estágio atual não agrega diferencial técnico em relação ao acesso via browser.

---

## Consolidado Geral

| Módulo | ✅ Completo | ⚠️ Parcial | ❌ Ausente | Total |
|--------|:-----------:|:----------:|:---------:|:-----:|
| 1. Autenticação e Acesso | 3 | 4 | 2 | 9 |
| 2. Onboarding | 0 | 2 | 1 | 3 |
| 3. Busca e Descoberta | 5 | 2 | 0 | 7 |
| 4. Fluxo de Reserva | 5 | 3 | 1 | 10 |
| 5. Histórico de Reservas | 2 | 1 | 0 | 3 |
| 6. Cadastro de Espaço | 10 | 2 | 0 | 12 |
| 7. Gestão de Reservas | 6 | 2 | 0 | 8 |
| 8. Dashboard e Métricas | 4 | 0 | 3 | 7 |
| 9. Chat e Mensagens | 0 | 3 | 1 | 4 |
| 10. Perfil do Usuário | 7 | 2 | 1 | 10 |
| 11. Avaliações | 3 | 2 | 0 | 5 |
| 12. Notificações | 0 | 0 | 6 | 6 |
| 13. Pagamento | 2 | 0 | 6 | 8 |
| 14. App Mobile | 1 | 2 | 1 | 4 |
| **Total** | **48** | **25** | **22** | **96** |

```
Distribuição geral
──────────────────────────────────────────────────
✅ Completo    48 itens  ████████████████████  50%
⚠️  Parcial    25 itens  ██████████░░░░░░░░░░  26%
❌ Ausente     22 itens  █████████░░░░░░░░░░░  23%
──────────────────────────────────────────────────
```

---

*Relatório gerado em 22 de maio de 2026 · TrinityWeb*
