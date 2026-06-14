export type Decision = "included" | "deferred" | "removed";

export type Complexity = "P" | "M" | "G" | "XG";

export interface Feature {
  code?: string;
  name: string;
  decision: Decision;
  complexity: Complexity;
  hours: number;
  originalHours?: number;
  notes?: string;
  isNew?: boolean;
  isBackoffice?: boolean;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  features: Feature[];
}

export interface Project {
  name: string;
  subtitle: string;
  vendor: string;
  stack: string[];
  approach: string;
  hourlyRate: number;
  hoursPerDay: number;
  currency: string;
  sheetId?: string;
  sheetGid?: string;
  lastSyncedAt?: string;
}

export interface Legend {
  included: string;
  deferred: string;
  removed: string;
}

export interface MvpData {
  project: Project;
  legend: Legend;
  modules: Module[];
}

export interface ModuleSummary {
  id: string;
  name: string;
  includedHours: number;
  deferredHours: number;
  removedHours?: number;
  includedCount: number;
  deferredCount: number;
  removedCount: number;
  totalCount: number;
}

export interface Totals {
  includedHours: number;
  deferredHours: number;
  removedHours?: number;
  includedCount: number;
  deferredCount: number;
  removedCount: number;
  totalCount: number;
  estimatedCost: number;
  estimatedDays: number;
}
