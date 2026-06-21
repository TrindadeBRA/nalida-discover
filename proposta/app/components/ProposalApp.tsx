"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { MvpData, Project } from "@/lib/types";
import { computeTotals, summarizeModule, formatCurrency } from "@/lib/compute";
import { updateProject } from "@/lib/mutations";
import { CATEGORY_LABEL, type Category } from "@/lib/category";
import { ModuleCard } from "./ModuleCard";
import { SprintPlan } from "./SprintPlan";
import { DeliveryValue } from "./DeliveryValue";
import { PaymentSchedule } from "./PaymentSchedule";

type FilterKey = "all" | Category;
type SaveState = "idle" | "saving" | "saved" | "error";

const FILTERS: { key: FilterKey; label: string; cat?: Category }[] = [
  { key: "all", label: "Todas" },
  { key: "manter", label: CATEGORY_LABEL.manter, cat: "manter" },
  { key: "novo", label: CATEGORY_LABEL.novo, cat: "novo" },
  { key: "backoffice", label: CATEGORY_LABEL.backoffice, cat: "backoffice" },
  { key: "remover", label: CATEGORY_LABEL.remover, cat: "remover" },
];

export function ProposalApp({ initialData, archDiagram }: { initialData: MvpData; archDiagram?: React.ReactNode }) {
  const [data, setData] = useState<MvpData>(initialData);
  const [edit, setEdit] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [dirty, setDirty] = useState(false);
  const [save, setSave] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const totals = useMemo(() => computeTotals(data, filter), [data, filter]);
  const totalsAll = useMemo(() => computeTotals(data, "all"), [data]);
  const totalsBackoffice = useMemo(() => computeTotals(data, "backoffice"), [data]);
  const totalsRemoved = useMemo(() => computeTotals(data, "remover"), [data]);
  const summaries = useMemo(
    () => Object.fromEntries(data.modules.map((m) => [m.id, summarizeModule(m, filter)])),
    [data, filter]
  );
  const { project } = data;

  const patchProject = useCallback((patch: Partial<Project>) => {
    setData((prev) => updateProject(prev, patch));
    setDirty(true);
    setSave("idle");
  }, []);

  const handleSave = useCallback(async () => {
    setSave("saving");
    setError(null);
    try {
      const res = await fetch("/api/mvp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao salvar.");
      setData(body as MvpData);
      setDirty(false);
      setSave("saved");
      setTimeout(() => setSave("idle"), 2500);
    } catch (e) {
      setSave("error");
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    }
  }, [data]);

  const handleSync = useCallback(async () => {
    if (
      dirty &&
      !confirm(
        "Há alterações locais não salvas. Sincronizar vai sobrescrever os dados com o conteúdo da planilha. Continuar?"
      )
    ) {
      return;
    }
    setSyncing(true);
    setError(null);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Falha ao sincronizar.");
      setData(body.data as MvpData);
      setDirty(false);
      setSave("idle");
      setSyncMsg(
        `Sincronizado: ${body.stats.modules} módulos, ${body.stats.features} funcionalidades.`
      );
      setTimeout(() => setSyncMsg(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao sincronizar.");
    } finally {
      setSyncing(false);
    }
  }, [dirty]);

  return (
    <main>
      <header className="hero">
        <div className="container">
          <div className="hero__top">
            {/* Logo Nalida inline */}
            <div className="hero__logo">
              <svg viewBox="0 0 119 97" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Nalida">
                <path d="M3.6 77.66a8.5 8.5 0 017.24-4.1c4.84 0 7.24 3.19 7.24 8v14H14.4v-13.6c0-3.1-1.53-5.13-4.13-5.13-2.6 0-4.92 2.07-6.5 4.51v14.23H0V74.06h3.6v3.6zM32.8 73.52a9.32 9.32 0 016 2.24v-1.74h3.39v16.3c0 2.1 1.24 2.52 2.44 2.52l-.79 2.89c-2.69 0-4.26-1.11-4.8-3.22a8 8 0 01-6.74 3.51c-5.37 0-9.68-4.34-9.68-11.12 0-6.38 4.18-11.38 10.18-11.38zm5.66 16.51V78.52a9.25 9.25 0 00-5.29-1.74c-4 0-6.74 3.23-6.74 8s2.85 7.94 6.7 7.94a7.08 7.08 0 005.33-2.65v-.04zM52.69 88.45c0 3 1.32 4.39 3.51 4.39a7.49 7.49 0 002.86-.62l.91 3a10.572 10.572 0 01-4.26.82c-3.81 0-6.74-2.07-6.74-7.23V64.96h3.72v23.49zM66.79 95.57h-3.72V74.06h3.72v21.51zM71.55 84.94c0-6.54 4.34-11.38 9.55-11.38a8.58 8.58 0 016.12 2.65V64.96h3.72v25.4c0 2.1 1.24 2.52 2.44 2.52l-.78 2.89c-2.65 0-4.22-1.07-4.8-3.14a7.89 7.89 0 01-6.66 3.43c-5.33 0-9.59-4.34-9.59-11.12zm15.67 5.21V79.52a7.05 7.05 0 00-5.29-2.69c-4 0-6.58 3.52-6.58 8s2.86 7.94 6.62 7.94a7.003 7.003 0 005.25-2.62zM106.24 73.52a9.301 9.301 0 016 2.24v-1.74h3.39v16.3c0 2.1 1.24 2.52 2.44 2.52l-.78 2.89c-2.69 0-4.26-1.11-4.8-3.22a7.995 7.995 0 01-6.74 3.51c-5.38 0-9.68-4.34-9.68-11.12 0-6.38 4.18-11.38 10.17-11.38zm5.67 16.51V78.52a9.27 9.27 0 00-5.29-1.74c-4 0-6.74 3.23-6.74 8s2.85 7.94 6.7 7.94a7.1 7.1 0 005.33-2.65v-.04z" fill="#fff"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M46.63 13.02a27.41 27.41 0 0134.21-1 3.33 3.33 0 004.26-.24l.06-.06a3.13 3.13 0 00-.36-4.85 33.93 33.93 0 00-40.84 0 3.13 3.13 0 00-.37 4.85l1.27 1.26a1.29 1.29 0 001.77.07v-.03zm4.93 6.66v.06a3.22 3.22 0 004 .43 16.3 16.3 0 0117.51 0 3.22 3.22 0 004-.42l.07-.07a3.21 3.21 0 00-.59-5 22.79 22.79 0 00-24.47 0 3.221 3.221 0 00-.52 4.97v.03zM71.08 27.17a9.48 9.48 0 100 13.41 9.49 9.49 0 000-13.41z" fill="#a6ce42"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M75.89 45.39a16.29 16.29 0 01-26.36-18.22 3.24 3.24 0 00-.59-3.64l-.16-.15a3.16 3.16 0 00-5.11 1 22.92 22.92 0 004.58 25.68l12 12a5.78 5.78 0 008.16 0l12-12a22.92 22.92 0 004.58-25.68 3.16 3.16 0 00-5.11-1l-.15.15a3.23 3.23 0 00-.6 3.64 16.29 16.29 0 01-3.33 18.22" fill="#A6CE42"/>
              </svg>
              <span className="hero__logo-sep" />
              <span className="hero__logo-label">{project.vendor} · Proposta de MVP</span>
            </div>
            <div className="toolbar">
              <button
                className="btn"
                onClick={handleSync}
                disabled={syncing}
                title="Puxar dados da planilha do Google Sheets"
              >
                <span style={{ fontSize: "18px", lineHeight: 1 }}>⟳</span>
                {syncing ? "Sincronizando…" : "Sincronizar planilha"}
              </button>
              {edit && (
                <button
                  className="btn btn--primary"
                  onClick={handleSave}
                  disabled={!dirty || save === "saving"}
                >
                  <span style={{ fontSize: "16px", lineHeight: 1 }}>
                    {save === "saving" ? "…" : save === "saved" ? "✓" : "↓"}
                  </span>
                  {save === "saving"
                    ? "Salvando…"
                    : save === "saved"
                    ? "Salvo"
                    : "Salvar no JSON"}
                </button>
              )}
              <button
                className="btn"
                data-active={edit}
                onClick={() => setEdit((v) => !v)}
                title="Editar as informações iniciais da proposta"
              >
                <span style={{ fontSize: "20px", lineHeight: 1 }}>{edit ? "✕" : "✎"}</span>
                {edit ? "Concluir edição" : "Editar informações"}
              </button>
            </div>
          </div>

          <EditableText
            edit={edit}
            value={project.name}
            className="hero__title"
            placeholder="Nome do projeto"
            onChange={(v) => patchProject({ name: v })}
          />
          <EditableText
            edit={edit}
            value={project.subtitle}
            className="hero__subtitle"
            placeholder="Subtítulo"
            onChange={(v) => patchProject({ subtitle: v })}
          />
          <EditableText
            edit={edit}
            value={project.approach}
            className="hero__approach"
            placeholder="Abordagem / resumo da proposta"
            multiline
            onChange={(v) => patchProject({ approach: v })}
          />

          {edit && (
            <ProjectParams project={project} onChange={patchProject} />
          )}
        </div>
      </header>

      {archDiagram}

      <div className="container">
        {error && <div className="alert alert--error">{error}</div>}
        {syncMsg && <div className="alert alert--ok">{syncMsg}</div>}
        {dirty && edit && !error && (
          <div className="alert alert--warn">
            Alterações não salvas. Clique em “Salvar no JSON”.
          </div>
        )}

        <section className="section">
          <div className="section__head">
            <h2 className="section__title">Escopo por módulo</h2>
            <p className="section__sub">
              Os módulos e funcionalidades vêm da planilha. Filtre por decisão e
              expanda cada módulo para ver as horas e observações.
            </p>
          </div>

          <div className="filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className="filter-btn"
                data-active={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.cat && <span className={`dot dot--${f.cat}`} />}
                {f.label}
              </button>
            ))}
          </div>

          {data.modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              summary={summaries[module.id]}
              filter={filter}
            />
          ))}
        </section>

        <SprintPlan totalHours={totalsAll.includedHours} />

        <DeliveryValue />

        <section className="kpis">
          <div className="kpi">
            <div className="kpi__label">
              {filter === "all" ? "Esforço do MVP" : `Esforço · ${CATEGORY_LABEL[filter as Category] ?? "Todas"}`}
            </div>
            <div className="kpi__value">
              {filter === "remover"
                ? `${totals.removedHours ?? 0}h`
                : `${totals.includedHours}h`}
            </div>
            <div className="kpi__hint">
              {filter === "remover"
                ? `${totals.removedCount} itens removidos`
                : `~${totals.estimatedDays} dias úteis (${project.hoursPerDay}h/dia)`}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi__label">Investimento estimado</div>
            <div className="kpi__value">
              {formatCurrency(totals.estimatedCost, project.currency)}
            </div>
            {edit ? (
              <div className="kpi__rate-edit">
                <span>{project.currency}</span>
                <input
                  type="number"
                  min={0}
                  value={project.hourlyRate}
                  onChange={(e) =>
                    patchProject({ hourlyRate: Number(e.target.value) })
                  }
                />
                <span>/hora</span>
              </div>
            ) : (
              <div className="kpi__hint">
                {formatCurrency(project.hourlyRate, project.currency)}/hora
              </div>
            )}
          </div>
          <div className="kpi kpi--links">
            <div className="kpi__label">Links úteis</div>
            <div className="quick-links">
              <a
                href="https://docs.google.com/spreadsheets/d/1I-L9yvpaWduEiCHTM3GkfhvrfYU1kg9h-nCtK_9scT8/edit?gid=552375468#gid=552375468"
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link"
              >
                <svg className="quick-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
                <span className="quick-link__text">Planilha de requisitos</span>
                <svg className="quick-link__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </a>
              <a
                href="https://github.com/TrindadeBRA/nalida-discover/blob/master/final-docs/relatorio-analise-frontend.md#tela-profile"
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link"
              >
                <svg className="quick-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8M12 17v4"/>
                </svg>
                <span className="quick-link__text">Relatório de interfaces</span>
                <svg className="quick-link__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </a>
              <a
                href="https://github.com/TrindadeBRA/nalida-discover/blob/master/final-docs/relatorio-funcionalidades.md"
                target="_blank"
                rel="noopener noreferrer"
                className="quick-link"
              >
                <svg className="quick-link__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="M9 12h6M9 16h4"/>
                </svg>
                <span className="quick-link__text">Relatório de funcionalidades</span>
                <svg className="quick-link__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </a>
            </div>
          </div>
        </section>

        <PaymentSchedule total={totalsAll.estimatedCost} currency={project.currency} />
      </div>

      <footer className="footer">
        <div className="container">
          {project.lastSyncedAt && (
            <div className="footer__sync">
              Última sincronização com a planilha:{" "}
              {new Date(project.lastSyncedAt).toLocaleString("pt-BR")}
            </div>
          )}
          Estimativas indicativas, sujeitas a refinamento no detalhamento técnico. ·{" "}
          {project.vendor}
        </div>
      </footer>
    </main>
  );
}

function ProjectParams({
  project,
  onChange,
}: {
  project: Project;
  onChange: (patch: Partial<Project>) => void;
}) {
  return (
    <div className="params">
      <label className="param">
        <span>Valor/hora ({project.currency})</span>
        <input
          type="number"
          min={0}
          value={project.hourlyRate}
          onChange={(e) => onChange({ hourlyRate: Number(e.target.value) })}
        />
      </label>
      <label className="param">
        <span>Horas por dia</span>
        <input
          type="number"
          min={1}
          value={project.hoursPerDay}
          onChange={(e) => onChange({ hoursPerDay: Number(e.target.value) })}
        />
      </label>
      <label className="param">
        <span>Moeda</span>
        <input
          type="text"
          value={project.currency}
          onChange={(e) => onChange({ currency: e.target.value })}
        />
      </label>
    </div>
  );
}

function EditableText({
  edit,
  value,
  className,
  multiline,
  placeholder,
  onChange,
}: {
  edit: boolean;
  value: string;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  if (!edit) {
    if (!value) return null;
    return <p className={className}>{value}</p>;
  }
  if (multiline) {
    return (
      <textarea
        className={`inline-input ${className ?? ""}`}
        value={value}
        rows={3}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      className={`inline-input ${className ?? ""}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
