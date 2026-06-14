"use client";

import { useMemo, useState } from "react";
import type { Decision, Legend, Module, ModuleSummary } from "@/lib/types";
import { ModuleCard } from "./ModuleCard";

type FilterKey = "all" | Decision;

const FILTERS: { key: FilterKey; label: string; dot?: Decision }[] = [
  { key: "all", label: "Todas" },
  { key: "included", label: "No MVP", dot: "included" },
  { key: "deferred", label: "Adiadas", dot: "deferred" },
  { key: "removed", label: "Removidas", dot: "removed" },
];

interface Props {
  modules: Module[];
  summaries: ModuleSummary[];
  legend: Legend;
}

export function ScopeExplorer({ modules, summaries, legend }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const summaryById = useMemo(
    () => Object.fromEntries(summaries.map((s) => [s.id, s])),
    [summaries]
  );

  return (
    <>
      <div className="legend">
        <div className="legend__item">
          <span className="dot dot--included" style={{ marginTop: 5 }} />
          <span>
            <strong>No MVP</strong>
            {legend.included}
          </span>
        </div>
        <div className="legend__item">
          <span className="dot dot--deferred" style={{ marginTop: 5 }} />
          <span>
            <strong>Adiada (v2)</strong>
            {legend.deferred}
          </span>
        </div>
        <div className="legend__item">
          <span className="dot dot--removed" style={{ marginTop: 5 }} />
          <span>
            <strong>Removida</strong>
            {legend.removed}
          </span>
        </div>
      </div>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className="filter-btn"
            data-active={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.dot && <span className={`dot dot--${f.dot}`} />}
            {f.label}
          </button>
        ))}
      </div>

      {modules.map((module) => (
        <ModuleCard
          key={module.id}
          module={module}
          summary={summaryById[module.id]}
          filter={filter}
        />
      ))}
    </>
  );
}
