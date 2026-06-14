"use client";

import { useState } from "react";
import type { Module, ModuleSummary } from "@/lib/types";
import { CATEGORY_LABEL, featureCategory, type Category } from "@/lib/category";

type FilterKey = "all" | Category;

interface Props {
  module: Module;
  summary: ModuleSummary;
  filter: FilterKey;
}

/** Computes per-category hours from the visible feature list. */
function categoryHours(features: ReturnType<typeof Array.prototype.filter>) {
  const acc: Record<Category, number> = { manter: 0, novo: 0, adiar: 0, remover: 0, backoffice: 0 };
  for (const f of features as Array<{ hours: number; decision: string; isNew?: boolean }>) {
    const cat = featureCategory(f as Parameters<typeof featureCategory>[0]);
    // removed items carry 0 h — give them a fixed visual weight so they show on the bar
    acc[cat] += f.hours > 0 ? f.hours : 0;
  }
  return acc;
}

const CAT_ORDER: Category[] = ["manter", "novo", "backoffice", "adiar", "remover"];

// Visual weight for removed items (they have 0 h but must appear on bar)
const REMOVED_VISUAL_H = 6;

export function ModuleCard({ module, summary, filter }: Props) {
  const [open, setOpen] = useState(false);

  const visibleFeatures = module.features.filter(
    (f) => filter === "all" || featureCategory(f) === filter
  );

  if (visibleFeatures.length === 0) return null;

  // --- minibar ---
  const catH = categoryHours(visibleFeatures);

  // Give zero-hour categories a visual slot when they have items
  const removedCount = visibleFeatures.filter((f) => featureCategory(f) === "remover").length;
  const removedVisual = removedCount > 0 && catH.remover === 0 ? REMOVED_VISUAL_H * removedCount : catH.remover;

  const denom =
    catH.manter + catH.novo + catH.adiar + removedVisual || 1;

  const segments: { cat: Category; w: number }[] = CAT_ORDER.map((cat) => ({
    cat,
    w: cat === "remover" ? removedVisual : catH[cat],
  })).filter((s) => s.w > 0);

  // --- header hours label ---
  const headerHours =
    filter === "remover"
      ? `${summary.removedHours ?? 0}h`
      : filter === "novo"
      ? `${catH.novo}h`
      : filter === "adiar"
      ? `${catH.adiar}h`
      : filter === "backoffice"
      ? `${catH.backoffice}h`
      : `${summary.includedHours}h`;

  const headerLabel =
    filter === "remover"
      ? "removidas"
      : filter === "novo"
      ? "novos"
      : filter === "adiar"
      ? "adiadas"
      : filter === "backoffice"
      ? "backoffice"
      : "no MVP";

  return (
    <div className="module">
      <div className="module__head" onClick={() => setOpen((v) => !v)}>
        <span className="module__chevron" data-open={open}>
          ▶
        </span>

        <div className="module__title">
          {module.name}
          {module.description && (
            <div className="module__desc">{module.description}</div>
          )}
        </div>

        <div
          className="minibar"
          title={segments.map((s) => `${CATEGORY_LABEL[s.cat]}: ${s.w}h`).join(" · ")}
        >
          {segments.map((s) => (
            <span
              key={s.cat}
              className={`minibar__seg minibar__seg--${s.cat}`}
              style={{ width: `${(s.w / denom) * 100}%` }}
            />
          ))}
        </div>

        <div className="module__hours">
          {headerHours}
          <small>{headerLabel}</small>
        </div>
      </div>

      {open && (
        <div className="module__body">
          {visibleFeatures.map((feature, index) => {
            const category = featureCategory(feature);
            return (
              <div className="feature" key={`${feature.code ?? "f"}-${index}`}>
                <span className={`badge badge--${category}`}>
                  {CATEGORY_LABEL[category]}
                </span>
                <div className="feature__main">
                  <div className="feature__name">
                    {feature.code && (
                      <span className="feature__code">{feature.code}</span>
                    )}
                    {feature.name}
                  </div>
                  {feature.notes && (
                    <div className="feature__notes">
                      <span className="feature__notes-icon">✎</span>
                      <span>{feature.notes}</span>
                    </div>
                  )}
                </div>
                <span
                  className={`feature__hours${
                    feature.hours === 0 ? " feature__hours--zero" : ""
                  }`}
                >
                  {feature.hours === 0 ? "—" : `${feature.hours}h`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
