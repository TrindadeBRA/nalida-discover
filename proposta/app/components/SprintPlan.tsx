"use client";

interface Sprint {
  n: number;
  weeks: string;
  title: string;
  focus: string[];
  delivery: string;
  testable: string[];
}

interface Month {
  month: string;
  label: string;
  sprints: Sprint[];
}

/**
 * Editorial 4-month delivery plan (8 two-week sprints). The per-sprint hours
 * sum to the MVP's included effort, so the plan stays consistent with the
 * scope totals computed from the JSON.
 */
const PLAN: Month[] = [
  {
    month: "Mês 1",
    label: "Fundação & Acesso",
    sprints: [
      {
        n: 1,
        weeks: "Semanas 1–2",
        title: "Fundação técnica & Autenticação",
        focus: [
          "Setup de infra: VPS, Nginx, PostgreSQL, Prisma e CI/CD",
          "Login, cadastro, refresh de token e proteção de rotas",
          "Esqueci a senha e onboarding (geolocalização e aceites)",
        ],
        delivery: "Ambiente em produção com fluxo de acesso funcional.",
        testable: [
          "Criar conta e fazer login/logout",
          "Recuperar senha por e-mail",
          "Acessar a área logada com sessão persistente",
        ],
      },
      {
        n: 2,
        weeks: "Semanas 3–4",
        title: "Perfil do usuário & KYC",
        focus: [
          "Perfil, edição de dados pessoais e endereços",
          "Cartões de crédito e conta bancária de recebimento",
          "Verificação de identidade (documento + câmera)",
        ],
        delivery: "Perfil completo com meios de pagamento e verificação.",
        testable: [
          "Editar perfil e gerenciar endereços",
          "Cadastrar cartão e conta bancária de recebimento",
          "Enviar documento para verificação de identidade",
        ],
      },
    ],
  },
  {
    month: "Mês 2",
    label: "Espaços & Descoberta",
    sprints: [
      {
        n: 3,
        weeks: "Semanas 5–6",
        title: "Cadastro de espaço",
        focus: [
          "Infos gerais, endereço por CEP e configurações físicas",
          "Valores, descontos, disponibilidade, comodidades e regras",
          "Upload de fotos (Cloudflare R2) e publicação",
        ],
        delivery: "Proprietário cadastra e publica um espaço completo.",
        testable: [
          "Preencher o cadastro de espaço ponta a ponta",
          "Subir fotos e definir valores e disponibilidade",
          "Publicar o espaço e vê-lo ativo",
        ],
      },
      {
        n: 4,
        weeks: "Semanas 7–8",
        title: "Busca & Descoberta",
        focus: [
          "Listagem por categoria e proximidade",
          "Busca textual, filtros e mapa (Leaflet + Nominatim)",
          "Detalhe do espaço, paginação infinita e nota média",
        ],
        delivery: "Vitrine pública de espaços com busca, filtros e mapa.",
        testable: [
          "Buscar por cidade/bairro e aplicar filtros",
          "Visualizar espaços no mapa",
          "Abrir o detalhe completo de um espaço",
        ],
      },
    ],
  },
  {
    month: "Mês 3",
    label: "Reserva & Pagamento",
    sprints: [
      {
        n: 5,
        weeks: "Semanas 9–10",
        title: "Fluxo de reserva & cobrança",
        focus: [
          "Datas, horários, disponibilidade e cálculo de valor no backend",
          "Criação da reserva e confirmação por e-mail",
          "Gateway de pagamento, webhook e recibo",
        ],
        delivery: "Reserva paga ponta a ponta com cobrança real no gateway.",
        testable: [
          "Reservar um espaço escolhendo data e horário",
          "Pagar a reserva com cartão (transação real)",
          "Receber a confirmação e o recibo por e-mail",
        ],
      },
      {
        n: 6,
        weeks: "Semanas 11–12",
        title: "Repasse & Painel do proprietário",
        focus: [
          "Split de pagamento, reembolso e histórico de transações",
          "Aprovar/negar reservas, agenda visual e presença",
          "Gestão dos espaços do proprietário",
        ],
        delivery: "Proprietário gerencia reservas e recebe o repasse.",
        testable: [
          "Aprovar ou negar uma reserva pendente",
          "Acompanhar agenda, presença e histórico de transações",
          "Validar repasse (split) e reembolso de cancelamento",
        ],
      },
    ],
  },
  {
    month: "Mês 4",
    label: "Engajamento & Entrega",
    sprints: [
      {
        n: 7,
        weeks: "Semanas 13–14",
        title: "Chat, histórico & avaliações",
        focus: [
          "Chat com anexos e histórico persistido",
          "Histórico de reservas do locatário",
          "Avaliações de espaço, proprietário e locatário",
        ],
        delivery: "Comunicação entre as partes e sistema de reputação ativos.",
        testable: [
          "Conversar no chat com envio de anexos",
          "Consultar o histórico de reservas",
          "Avaliar o espaço, o proprietário e o locatário",
        ],
      },
      {
        n: 8,
        weeks: "Semanas 15–16",
        title: "Notificações, dashboard & estabilização",
        focus: [
          "E-mails transacionais (reserva, boas-vindas, lembretes)",
          "Dashboard de métricas e telas de backoffice (admin)",
          "QA, hardening, deploy de produção e homologação",
        ],
        delivery: "Produto homologado em produção, pronto para lançamento.",
        testable: [
          "Receber os e-mails transacionais nos eventos da reserva",
          "Navegar pelo dashboard de métricas do proprietário",
          "Operar o backoffice (usuários, espaços e reservas)",
        ],
      },
    ],
  },
];

export function SprintPlan({ totalHours }: { totalHours: number }) {
  const sprintCount = PLAN.reduce((acc, m) => acc + m.sprints.length, 0);

  return (
    <section className="sprints">
      <div className="section__head">
        <h2 className="section__title">Planejamento de sprints</h2>
        <p className="section__sub">
          Execução em 4 meses, organizada em {sprintCount} sprints de 2 semanas.
          Cada sprint entrega um incremento utilizável, na ordem das dependências
          técnicas — da fundação ao pagamento e à estabilização.
        </p>
      </div>

      <div className="sprint-meta">
        <span className="sprint-meta__chip">4 meses</span>
        <span className="sprint-meta__chip">{sprintCount} sprints · 2 semanas</span>
        <span className="sprint-meta__chip">≈ {totalHours}h de esforço</span>
      </div>

      {PLAN.map((m) => (
        <div className="sprint-month" key={m.month}>
          <div className="sprint-month__head">
            <span className="sprint-month__tag">{m.month}</span>
            <span className="sprint-month__label">{m.label}</span>
          </div>

          <div className="sprint-grid">
            {m.sprints.map((s) => (
              <div className="sprint-card" key={s.n}>
                <div className="sprint-card__head">
                  <div>
                    <div className="sprint-card__n">
                      Sprint {s.n} · {s.weeks}
                    </div>
                    <div className="sprint-card__title">{s.title}</div>
                  </div>
                </div>

                <div className="sprint-card__block">
                  <span className="sprint-card__label">O que será feito</span>
                  <ul className="sprint-card__focus">
                    {s.focus.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="sprint-card__block sprint-card__block--deliver">
                  <span className="sprint-card__label">Entregável</span>
                  <p className="sprint-card__delivery">{s.delivery}</p>
                </div>

                <div className="sprint-card__block">
                  <span className="sprint-card__label sprint-card__label--test">
                    Cliente pode testar
                  </span>
                  <ul className="sprint-card__test">
                    {s.testable.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
