"use client";

import { formatCurrency } from "@/lib/compute";

interface Milestone {
  label: string;
  when: string;
}

const MILESTONES: Milestone[] = [
  { label: "Entrada", when: "Na assinatura do contrato" },
  { label: "Fim do Mês 1", when: "Sprints 1–2 entregues" },
  { label: "Fim do Mês 2", when: "Sprints 3–4 entregues" },
  { label: "Fim do Mês 3", when: "Sprints 5–6 entregues" },
  { label: "Fim do Mês 4", when: "Entrega final · Sprints 7–8" },
];

/** Splits a total into n integer parts that sum back exactly to the total. */
function splitEqually(total: number, n: number): number[] {
  const base = Math.floor(total / n);
  const rest = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < rest ? 1 : 0));
}

export function PaymentSchedule({
  total,
  currency,
}: {
  total: number;
  currency: string;
}) {
  const parts = splitEqually(total, MILESTONES.length);
  const pct = Math.round((1 / MILESTONES.length) * 100);

  return (
    <section className="payment">
      <div className="section__head">
        <h2 className="section__title">Condições de pagamento</h2>
        <p className="section__sub">
          Investimento dividido em {MILESTONES.length} parcelas: entrada no ato e
          uma parcela ao final de cada mês (a cada 2 sprints entregues). Você paga
          conforme recebe e valida cada incremento.
        </p>
      </div>

      <div className="pay-grid">
        {MILESTONES.map((m, i) => (
          <div className="pay-card" key={m.label}>
            <div className="pay-card__step">{i + 1}/{MILESTONES.length}</div>
            <div className="pay-card__label">{m.label}</div>
            <div className="pay-card__value">{formatCurrency(parts[i], currency)}</div>
            <div className="pay-card__pct">{pct}% do total</div>
            <div className="pay-card__when">{m.when}</div>
          </div>
        ))}
      </div>

      <p className="pay-total">
        Total do investimento:{" "}
        <strong>{formatCurrency(total, currency)}</strong>
      </p>
    </section>
  );
}
