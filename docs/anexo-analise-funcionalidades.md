# Anexo Técnico — Análise de Funcionalidades
## Nalida · Fase Discover · Maio 2026

---

> **Como ler este documento**
> Cada funcionalidade foi avaliada em duas dimensões independentes — o que o **frontend** apresenta ao usuário e o que o **backend** entrega de fato. O cruzamento entre as duas resulta no status final.
>
> | | Descrição |
> |---|---|
> | ✅ **Completo** | Implementado e funcional nas duas camadas |
> | ⚠️ **Parcial** | Existe em uma camada, mas incompleto ou desconectado na outra |
> | ❌ **Ausente** | Funcionalidade esperada sem implementação real em nenhuma das camadas |

---

## Bloco 1 — Autenticação e Acesso

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 1.1 | Login com Google | ✅ | ✅ | ✅ **Completo** |
| 1.2 | Login com e-mail e senha | ✅ | ⚠️ | ⚠️ **Parcial** |
| 1.3 | Login com Apple | ❌ | ❌ | ❌ **Ausente** |
| 1.4 | Login com Facebook | ❌ | ❌ | ❌ **Ausente** |
| 1.5 | Cadastro de novo usuário | ✅ | ⚠️ | ⚠️ **Parcial** |
| 1.6 | Logout e encerramento de sessão | ✅ | ✅ | ✅ **Completo** |
| 1.7 | Renovação automática de token (refresh) | ❌ | ⚠️ | ⚠️ **Parcial** |
| 1.8 | Bloqueio de acesso para menores de 18 anos | ✅ | ❌ | ⚠️ **Parcial** |

**Observações relevantes**

- **1.2** — O frontend possui a tela de login por e-mail e senha; porém, o backend processa apenas tokens emitidos pelo Firebase Auth. Não existe um endpoint de autenticação direta com credenciais.
- **1.5** — O frontend conduz o usuário em duas etapas de cadastro (e-mail + dados pessoais). O backend não possui um endpoint de registro dedicado — o usuário é criado automaticamente no primeiro login via `upsert`. Dados como nome e data de nascimento preenchidos no cadastro não são persistidos nesse fluxo.
- **1.7** — O modelo de usuário armazena o `refreshToken`, mas não há endpoint `/auth/refresh`. Quando o token expira, o usuário é deslogado sem possibilidade de renovação silenciosa.
- **1.8** — A tela de bloqueio existe, mas a data de nascimento não é validada nem armazenada no backend — a restrição é apenas visual.

---

## Bloco 2 — Onboarding

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 2.1 | Captura de geolocalização inicial | ✅ | ❌ | ⚠️ **Parcial** |
| 2.2 | Aceite dos termos de privacidade | ✅ | ❌ | ⚠️ **Parcial** |
| 2.3 | Solicitação de permissão para notificações | ✅ | ❌ | ❌ **Ausente** |

**Observações relevantes**

- **2.1 / 2.2** — As telas existem e guiam o usuário, mas as respostas ficam apenas em memória local (contexto React). Não há persistência no banco de dados.
- **2.3** — A tela de autorização de notificações push está construída, mas sem nenhuma integração com serviço de mensageria (FCM ou equivalente). Clicar em "Autorizar" não produz efeito real.

---

## Bloco 3 — Busca e Descoberta de Espaços

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 3.1 | Listagem de espaços por categoria e proximidade | ✅ | ✅ | ✅ **Completo** |
| 3.2 | Busca por texto (cidade ou bairro) | ✅ | ⚠️ | ⚠️ **Parcial** |
| 3.3 | Filtros de preço, comodidades e distância | ✅ | ⚠️ | ⚠️ **Parcial** |
| 3.4 | Visualização em mapa com marcadores | ✅ | ✅ | ✅ **Completo** |
| 3.5 | Detalhe completo do espaço | ✅ | ✅ | ✅ **Completo** |
| 3.6 | Paginação de resultados | ✅ | ✅ | ✅ **Completo** |
| 3.7 | Avaliação média do espaço | ✅ | ✅ | ✅ **Completo** |

**Observações relevantes**

- **3.2** — O backend aceita filtros via query params, mas não implementa busca textual real (full-text search). A pesquisa funciona apenas como correspondência exata de campo — uma busca por "Paulista" não retorna "Av. Paulista".
- **3.3** — A interface de filtros está implementada no frontend; o backend aceita os parâmetros, mas não processa faixas de preço nem distância máxima de forma nativa. O filtro de distância é client-side.

---

## Bloco 4 — Fluxo de Reserva (perspectiva do locatário)

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 4.1 | Seleção de datas e horários | ✅ | ✅ | ✅ **Completo** |
| 4.2 | Verificação de disponibilidade em tempo real | ✅ | ✅ | ✅ **Completo** |
| 4.3 | Cálculo e exibição do valor total | ✅ | ⚠️ | ⚠️ **Parcial** |
| 4.4 | Seleção de hóspedes adicionais | ✅ | ✅ | ✅ **Completo** |
| 4.5 | Criação da reserva | ✅ | ✅ | ✅ **Completo** |
| 4.6 | **Processamento do pagamento** | ✅ | ❌ | ❌ **Ausente** |
| 4.7 | Confirmação pós-reserva (feedback ao usuário) | ✅ | ⚠️ | ⚠️ **Parcial** |
| 4.8 | Cancelamento de reserva pelo locatário | ✅ | ⚠️ | ⚠️ **Parcial** |

**Observações relevantes**

- **4.3** — O valor total é calculado e exibido exclusivamente no frontend. O backend armazena o valor enviado pelo cliente sem recalcular. Isso representa uma vulnerabilidade: um usuário mal-intencionado poderia manipular o valor antes do envio.
- **4.6** — **Gap crítico.** Toda a tela de pagamento — seleção de cartão, resumo financeiro, botão de confirmar — é funcional visualmente, mas o backend não executa nenhuma cobrança. O método responsável pelo processamento está completamente desativado no código. O sistema aceita a reserva, mas nenhuma transação financeira acontece.
- **4.7** — A tela de sucesso é exibida, mas o sistema não envia qualquer confirmação por e-mail, push ou mensagem ao usuário ou ao proprietário.
- **4.8** — O frontend tem a tela de cancelamento; o backend permite alterar o status da reserva via API, mas não aplica nenhuma política de cancelamento (prazo, multa, reembolso).

---

## Bloco 5 — Gestão de Reservas (perspectiva do proprietário)

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 5.1 | Listar reservas pendentes de aprovação | ✅ | ✅ | ✅ **Completo** |
| 5.2 | Aprovar reserva | ✅ | ✅ | ✅ **Completo** |
| 5.3 | Negar/recusar reserva | ✅ | ✅ | ✅ **Completo** |
| 5.4 | Listar reservas concluídas | ✅ | ✅ | ✅ **Completo** |
| 5.5 | Agenda visual do espaço | ✅ | ⚠️ | ⚠️ **Parcial** |
| 5.6 | Acompanhamento do status do hóspede | ✅ | ⚠️ | ⚠️ **Parcial** |

**Observações relevantes**

- **5.5** — A agenda é renderizada no frontend a partir de consultas genéricas de bookings. Não há endpoint dedicado de calendário com agrupamento por dia/semana.
- **5.6** — A tela de status do hóspede (check-in / check-out confirmado) existe no frontend, mas o backend não possui lógica de presença — o status não muda automaticamente.

---

## Bloco 6 — Cadastro de Espaço (fluxo do proprietário)

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 6.1 | Informações gerais (título, tipo, categoria) | ✅ | ✅ | ✅ **Completo** |
| 6.2 | Endereço com consulta automática por CEP | ✅ | ✅ | ✅ **Completo** |
| 6.3 | Configurações físicas (capacidade, tamanho, banheiros) | ✅ | ✅ | ✅ **Completo** |
| 6.4 | Valores (hora, diária, taxas, hóspede adicional) | ✅ | ✅ | ✅ **Completo** |
| 6.5 | Desconto para estadias longas | ✅ | ✅ | ✅ **Completo** |
| 6.6 | Disponibilidade e horários de funcionamento | ✅ | ✅ | ✅ **Completo** |
| 6.7 | Seleção de comodidades | ✅ | ✅ | ✅ **Completo** |
| 6.8 | Regras do espaço e instruções de check-in | ✅ | ✅ | ✅ **Completo** |
| 6.9 | Upload de fotos do espaço | ✅ | ⚠️ | ⚠️ **Parcial** |
| 6.10 | Política de cancelamento | ✅ | ✅ | ✅ **Completo** |
| 6.11 | Publicação e ativação do espaço | ✅ | ⚠️ | ⚠️ **Parcial** |

**Observações relevantes**

- **6.9** — As imagens são enviadas diretamente ao Firebase Storage via frontend. O backend armazena apenas a URL resultante, sem validar formato, tamanho ou quantidade máxima de imagens. Não há moderação de conteúdo.
- **6.11** — Ao concluir o cadastro, o espaço é criado e imediatamente visível na plataforma. Não existe um fluxo de revisão ou aprovação por parte da equipe Nalida antes da publicação.

---

## Bloco 7 — Dashboard e Métricas do Proprietário

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 7.1 | Quantidade de reservas por mês (últimos 6 meses) | ✅ | ✅ | ✅ **Completo** |
| 7.2 | Faturamento mensal (últimos 6 meses) | ✅ | ✅ | ✅ **Completo** |
| 7.3 | Quantidade de hóspedes por mês | ✅ | ✅ | ✅ **Completo** |
| 7.4 | Gráficos de evolução temporal | ✅ | ✅ | ✅ **Completo** |
| 7.5 | Taxa de ocupação do espaço | ❌ | ❌ | ❌ **Ausente** |
| 7.6 | Receita acumulada no ano (YTD) | ❌ | ❌ | ❌ **Ausente** |
| 7.7 | Ranking de horários mais reservados | ❌ | ❌ | ❌ **Ausente** |

**Observações relevantes**

- **7.1 a 7.4** — Funcionalidades implementadas e conectadas. Os dados de relatório são calculados diretamente das reservas no banco, sem necessidade de tabela de agregação separada.
- **7.5 a 7.7** — Métricas de inteligência de negócio não existem em nenhuma camada. São oportunidades de desenvolvimento para versões futuras.

---

## Bloco 8 — Chat e Mensagens

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 8.1 | Lista de conversas ativas | ✅ | ❌ | ⚠️ **Parcial** |
| 8.2 | Envio e recebimento de mensagens em tempo real | ✅ | ❌ | ⚠️ **Parcial** |
| 8.3 | Histórico de mensagens persistido | ✅ | ❌ | ⚠️ **Parcial** |
| 8.4 | Notificação de nova mensagem | ❌ | ❌ | ❌ **Ausente** |

**Observações relevantes**

- **8.1 a 8.3** — O chat funciona via Firebase Realtime Database, sem passar pela API principal. As mensagens são armazenadas no Firebase, não no MongoDB. A funcionalidade está operacional, mas desacoplada do restante do sistema.
- **8.4** — Não há qualquer mecanismo de alerta quando uma mensagem nova chega — nem push notification, nem badge de contador, nem e-mail.

---

## Bloco 9 — Perfil do Usuário

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 9.1 | Visualizar perfil próprio | ✅ | ✅ | ✅ **Completo** |
| 9.2 | Editar nome | ✅ | ✅ | ✅ **Completo** |
| 9.3 | Editar data de nascimento | ✅ | ⚠️ | ⚠️ **Parcial** |
| 9.4 | Gerenciar endereços | ✅ | ✅ | ✅ **Completo** |
| 9.5 | Adicionar cartão de crédito | ✅ | ✅ | ✅ **Completo** |
| 9.6 | Remover cartão de crédito | ✅ | ✅ | ✅ **Completo** |
| 9.7 | Cadastrar conta bancária para recebimento | ✅ | ⚠️ | ⚠️ **Parcial** |
| 9.8 | Verificação de identidade (documento + selfie) | ✅ | ❌ | ❌ **Ausente** |
| 9.9 | Visualizar perfil de outro usuário | ✅ | ✅ | ✅ **Completo** |

**Observações relevantes**

- **9.5** — Os dados do cartão (número e CVV) são encriptados no backend antes de serem armazenados. Esta é uma boa prática implementada corretamente.
- **9.7** — O campo de conta bancária para recebimento existe no banco de dados, mas não há validação dos dados bancários nem integração com o gateway de pagamento para configurar o split de repasse.
- **9.8** — O frontend possui um fluxo completo de verificação: captura de documento via câmera, foto selfie, confirmação. O backend não processa nenhuma dessas imagens — não há integração com serviço de validação de identidade (KYC). A funcionalidade existe como UI sem efeito prático.

---

## Bloco 10 — Avaliações

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 10.1 | Exibir nota média do espaço | ✅ | ✅ | ✅ **Completo** |
| 10.2 | Submeter avaliação de espaço | ❌ | ✅ | ⚠️ **Parcial** |
| 10.3 | Listar avaliações na página do espaço | ❌ | ✅ | ⚠️ **Parcial** |
| 10.4 | Avaliar o locatário após a estadia | ❌ | ✅ | ⚠️ **Parcial** |
| 10.5 | Avaliar o proprietário após a estadia | ❌ | ✅ | ⚠️ **Parcial** |

**Observações relevantes**

- O módulo de avaliações no backend está completo, com suporte para avaliação de espaços, locatários e proprietários. O frontend não possui nenhuma tela de submissão ou listagem de avaliações — o usuário vê a nota média no card do espaço, mas não consegue deixar ou ler reviews.

---

## Bloco 11 — Notificações

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 11.1 | Notificação push — reserva aprovada | ❌ | ❌ | ❌ **Ausente** |
| 11.2 | Notificação push — nova reserva pendente (proprietário) | ❌ | ❌ | ❌ **Ausente** |
| 11.3 | Notificação push — nova mensagem no chat | ❌ | ❌ | ❌ **Ausente** |
| 11.4 | E-mail de confirmação de reserva | ❌ | ❌ | ❌ **Ausente** |
| 11.5 | E-mail de boas-vindas pós-cadastro | ❌ | ❌ | ❌ **Ausente** |
| 11.6 | E-mail de lembrete antes da estadia | ❌ | ❌ | ❌ **Ausente** |

**Observações relevantes**

- Nenhuma forma de comunicação proativa com o usuário está implementada. Todo o sistema de notificações é ausente nas duas camadas. Este bloco representa um risco direto à experiência do usuário e ao índice de conversão de reservas.

---

## Bloco 12 — Pagamento

> Este bloco merece atenção especial. É o coração financeiro do produto e o maior gap identificado na análise.

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 12.1 | Cadastrar cartão de crédito no perfil | ✅ | ✅ | ✅ **Completo** |
| 12.2 | Listar e selecionar forma de pagamento | ✅ | ✅ | ✅ **Completo** |
| 12.3 | **Processar cobrança no momento da reserva** | ✅ | ❌ | ❌ **Ausente** |
| 12.4 | Webhook de confirmação do gateway | ❌ | ❌ | ❌ **Ausente** |
| 12.5 | Repasse ao proprietário (split de pagamento) | ❌ | ❌ | ❌ **Ausente** |
| 12.6 | Reembolso em cancelamentos | ❌ | ❌ | ❌ **Ausente** |
| 12.7 | Histórico de transações | ❌ | ❌ | ❌ **Ausente** |
| 12.8 | Recibo / comprovante de pagamento | ❌ | ❌ | ❌ **Ausente** |

**Observações relevantes**

- **12.3** — O backend possui campos de infraestrutura para pagamento (`acquirerOrderUid`, `acquirerName`, `paymentStatus`) e um endpoint de webhook (`POST /booking/pay/confirmation/:acquirer`), mas todo o código de processamento está comentado. Nenhum gateway (Stripe, PagarMe, Asaas etc.) está integrado. O produto, como está, aceita reservas mas **não realiza nenhuma transação financeira real**.
- **12.5** — Para que o proprietário receba os valores das reservas, é necessário um mecanismo de split. O campo `receiverMethods` no perfil do usuário foi desenhado para isso, mas sem integração com gateway é inoperante.

---

## Bloco 13 — App Mobile

| # | Funcionalidade | Frontend | Backend | Status |
|---|---|:---:|:---:|:---:|
| 13.1 | Telas nativas próprias | ❌ | — | ❌ **Ausente** |
| 13.2 | Carregamento da versão web via WebView | ✅ | — | ⚠️ **Parcial** |
| 13.3 | Builds automatizados via EAS (Expo) | ✅ | — | ✅ **Completo** |
| 13.4 | Geolocalização nativa | ⚠️ | — | ⚠️ **Parcial** |
| 13.5 | Câmera nativa | ⚠️ | — | ⚠️ **Parcial** |

**Observações relevantes**

- O aplicativo mobile é, em sua totalidade, um wrapper que carrega a versão web dentro de um componente WebView. Não existem telas, navegação ou componentes nativos desenvolvidos. As dependências de câmera e localização estão listadas no `package.json`, mas seu uso efetivo dentro do WebView é limitado pela política do browser embutido.
- Publicar este app nas lojas (App Store / Google Play) como produto independente, no estágio atual, não agrega diferencial técnico ou de experiência em relação ao acesso via browser.

---

## Consolidado Geral

| Bloco | Completo | Parcial | Ausente | Total |
|---|:---:|:---:|:---:|:---:|
| 1. Autenticação | 3 | 4 | 1 | 8 |
| 2. Onboarding | 0 | 2 | 1 | 3 |
| 3. Busca de Espaços | 5 | 2 | 0 | 7 |
| 4. Reserva (Locatário) | 4 | 3 | 1 | 8 |
| 5. Gestão de Reservas (Proprietário) | 4 | 2 | 0 | 6 |
| 6. Cadastro de Espaço | 9 | 2 | 0 | 11 |
| 7. Dashboard e Métricas | 4 | 0 | 3 | 7 |
| 8. Chat | 0 | 3 | 1 | 4 |
| 9. Perfil do Usuário | 5 | 2 | 1 | 8 |
| 10. Avaliações | 1 | 4 | 0 | 5 |
| 11. Notificações | 0 | 0 | 6 | 6 |
| 12. Pagamento | 2 | 0 | 6 | 8 |
| 13. App Mobile | 1 | 2 | 1 | 4 |
| **Total** | **38** | **26** | **21** | **85** |

```
Distribuição geral
──────────────────────────────────────────────────
✅ Completo    38 itens  ████████████████░░░░  45%
⚠️  Parcial    26 itens  ███████████░░░░░░░░░  31%
❌ Ausente     21 itens  █████████░░░░░░░░░░░  25%
──────────────────────────────────────────────────
```

---

## Itens Críticos para Lançamento Comercial

Os itens abaixo são bloqueadores diretos para que o produto opere como plataforma de negócio real:

| Prioridade | Item | Impacto |
|:---:|---|---|
| 🔴 **P0** | Integração com gateway de pagamento | Sem isso, o produto não gera receita |
| 🔴 **P0** | Validação do valor total no backend | Risco de fraude e prejuízo financeiro |
| 🔴 **P0** | Notificações de reserva (push ou e-mail) | Sem confirmação, conversões caem drasticamente |
| 🟠 **P1** | Renovação de token (auth/refresh) | Usuários são deslogados abruptamente |
| 🟠 **P1** | E-mail transacional (confirmação e boas-vindas) | Requisito mínimo de comunicação pós-cadastro |
| 🟠 **P1** | Tela de avaliação pós-reserva | O sistema de reputação existe no backend mas está inacessível |
| 🟡 **P2** | Verificação de identidade (KYC) | Importante para conformidade e segurança na plataforma |
| 🟡 **P2** | Fluxo de moderação de espaços | Controle de qualidade antes da publicação |
| 🟡 **P2** | Busca textual real (full-text search) | Experiência de descoberta comprometida sem isso |

---

*Documento produzido pela TrinityWeb como parte da entrega da Fase Discover do projeto Nalida — Maio 2026.*
