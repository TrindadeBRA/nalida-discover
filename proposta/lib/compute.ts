import type { Module, ModuleSummary, MvpData, Totals } from "./types";
import { featureCategory, type Category } from "./category";

type FilterKey = "all" | Category;

/**
 * Summarizes a module, counting only features that match the active filter.
 * When filter is "all" every feature is counted (original behavior).
 */
export function summarizeModule(
  module: Module,
  filter: FilterKey = "all"
): ModuleSummary {
  const summary: ModuleSummary = {
    id: module.id,
    name: module.name,
    includedHours: 0,
    deferredHours: 0,
    includedCount: 0,
    deferredCount: 0,
    removedCount: 0,
    totalCount: 0,
  };

  for (const feature of module.features) {
    if (filter !== "all" && featureCategory(feature) !== filter) continue;

    summary.totalCount += 1;

    if (feature.decision === "included") {
      summary.includedHours += feature.hours;
      summary.includedCount += 1;
    } else if (feature.decision === "deferred") {
      summary.deferredHours += feature.hours;
      summary.deferredCount += 1;
    } else {
      summary.removedCount += 1;
      summary.removedHours = (summary.removedHours ?? 0) + (feature.originalHours ?? 0);
    }
  }

  return summary;
}

/**
 * Computes global totals across all modules, filtered by the active category.
 */
export function computeTotals(
  data: MvpData,
  filter: FilterKey = "all"
): Totals {
  const totals: Totals = {
    includedHours: 0,
    deferredHours: 0,
    includedCount: 0,
    deferredCount: 0,
    removedCount: 0,
    totalCount: 0,
    estimatedCost: 0,
    estimatedDays: 0,
  };

  for (const module of data.modules) {
    const s = summarizeModule(module, filter);
    totals.includedHours += s.includedHours;
    totals.deferredHours += s.deferredHours;
    totals.includedCount += s.includedCount;
    totals.deferredCount += s.deferredCount;
    totals.removedCount += s.removedCount;
    totals.removedHours = (totals.removedHours ?? 0) + (s.removedHours ?? 0);
    totals.totalCount += s.totalCount;
  }

  totals.estimatedCost = totals.includedHours * data.project.hourlyRate;
  totals.estimatedDays = Math.ceil(
    totals.includedHours / (data.project.hoursPerDay || 1)
  );

  return totals;
}

export function formatCurrency(value: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
