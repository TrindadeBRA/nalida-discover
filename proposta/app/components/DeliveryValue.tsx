"use client";

import type { ReactNode } from "react";

interface ValueItem {
  icon: ReactNode;
  title: string;
  text: string;
}

const ITEMS: ValueItem[] = [
  {
    title: "Arquitetura bem definida",
    text: "Camadas separadas (API, portal e backoffice), padrões consistentes e banco modelado — uma base sólida que facilita manutenção e evolução do produto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="6" rx="1" />
        <rect x="2" y="16" width="6" height="6" rx="1" />
        <rect x="16" y="16" width="6" height="6" rx="1" />
        <path d="M12 8v3M5 16v-2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2" />
      </svg>
    ),
  },
  {
    title: "Planejamento ponta a ponta",
    text: "Escopo, sequenciamento em sprints e dependências mapeadas do primeiro commit ao lançamento. Previsibilidade de prazo e clareza do que é entregue a cada etapa.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="5" r="3" />
        <path d="M9 19h6.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H15" />
      </svg>
    ),
  },
  {
    title: "Ambientes de dev e produção",
    text: "Ambientes isolados de desenvolvimento e produção, com configuração reproduzível. Você valida em homologação antes de qualquer mudança ir ao ar.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="8" rx="2" />
        <rect x="2" y="13" width="20" height="8" rx="2" />
        <path d="M6 7h.01M6 17h.01M18 7h.01M18 17h.01" />
      </svg>
    ),
  },
  {
    title: "CI/CD",
    text: "Pipeline de integração e entrega contínua: cada alteração é verificada e publicada de forma automatizada, reduzindo erro humano e acelerando as entregas.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
      </svg>
    ),
  },
  {
    title: "Testes automatizados",
    text: "Cobertura de testes nos fluxos críticos — autenticação, reserva e pagamento — para evitar regressões e garantir estabilidade a cada nova versão.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Segurança por padrão",
    text: "Dados sensíveis criptografados, valores recalculados no backend e rotas protegidas. Segurança tratada desde o início, não como remendo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="11" r="1.6" />
        <path d="M12 12.6V15" />
      </svg>
    ),
  },
];

export function DeliveryValue() {
  return (
    <section className="value">
      <div className="section__head">
        <h2 className="section__title">Muito além das telas</h2>
        <p className="section__sub">
          O investimento não cobre só as funcionalidades visíveis. Ele entrega a
          engenharia que sustenta o produto a longo prazo — base técnica,
          processo e segurança para escalar com confiança.
        </p>
      </div>

      <div className="value-grid">
        {ITEMS.map((item) => (
          <div className="value-card" key={item.title}>
            <span className="value-card__icon">{item.icon}</span>
            <h3 className="value-card__title">{item.title}</h3>
            <p className="value-card__text">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
