import type { Complexity, Decision, Feature, Module, MvpData } from "./types";

export const DEFAULT_SHEET_ID = "1I-L9yvpaWduEiCHTM3GkfhvrfYU1kg9h-nCtK_9scT8";
export const DEFAULT_SHEET_GID = "552375468";

export function buildCsvUrl(sheetId: string, gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

/**
 * Minimal RFC-4180 CSV parser: handles quoted fields, escaped quotes ("")
 * and newlines inside quotes. Returns a matrix of rows × columns.
 */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // ignore; handled by \n
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

const ACTION_TO_DECISION: Record<string, Decision> = {
  manter: "included",
  remover: "removed",
  adiar: "deferred",
  novo: "included",
  backoffice: "included",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

/** Detects a section header row like "1. Autenticação e Acesso". */
function asSectionTitle(cells: string[]): string | null {
  const first = (cells[0] ?? "").trim();
  const rest = (cells[1] ?? "").trim() + (cells[2] ?? "").trim();
  if (first && !rest && /^\d+\.\s/.test(first)) {
    return first.replace(/^\d+\.\s*/, "").trim();
  }
  return null;
}

/** Detects a feature row like "1.2 | Login… | Manter | 4 | obs". */
function asFeatureRow(cells: string[]): {
  code: string;
  name: string;
  action: string;
  hours: number;
  notes: string;
} | null {
  const code = (cells[0] ?? "").trim();
  const name = (cells[1] ?? "").trim();
  const action = (cells[2] ?? "").trim();
  if (!/^\d+\.\d+/.test(code) || !name) return null;
  const rawHours = (cells[3] ?? "").trim();
  const hours = /^\d+(\.\d+)?$/.test(rawHours) ? Number(rawHours) : 0;
  return { code, name, action, hours, notes: (cells[4] ?? "").trim() };
}

/**
 * Converts the spreadsheet CSV into the MvpData shape. The sheet is the source
 * of truth for: which features exist, their action (Manter/Remover/Adiar),
 * estimated hours and notes.
 */
export function csvToMvp(csv: string): { modules: Module[]; totalFeatures: number } {
  const rows = parseCsv(csv);
  const modules: Module[] = [];
  let current: Module | null = null;
  let totalFeatures = 0;

  for (const cells of rows) {
    const joined = cells.join("").trim();
    if (!joined) continue;

    // Stop at the totals footer row.
    if (/total de horas/i.test(cells[0] ?? "")) break;

    const sectionTitle = asSectionTitle(cells);
    if (sectionTitle) {
      // "Novos Requisitos MVP" is a placeholder section in the sheet — skip it.
      if (/novos requisitos/i.test(sectionTitle)) {
        current = null;
        continue;
      }
      current = {
        id: slugify(sectionTitle) || `mod-${modules.length + 1}`,
        name: sectionTitle,
        description: "",
        features: [],
      };
      modules.push(current);
      continue;
    }

    const feature = asFeatureRow(cells);
    if (feature && current) {
      const action = feature.action.toLowerCase();
      const isNew = action === "novo";
      const isBackoffice = action === "backoffice";

      // Skip placeholder rows that were never filled in (e.g. "[NOVO] — inserir…").
      if (/^\[novo\]/i.test(feature.name)) continue;

      const decision = ACTION_TO_DECISION[action] ?? "included";
      const isRemoved = decision === "removed";

      current.features.push({
        code: feature.code,
        name: feature.name,
        decision,
        complexity: inferComplexity(feature.hours),
        hours: isRemoved ? 0 : feature.hours,
        ...(isRemoved && feature.hours > 0 ? { originalHours: feature.hours } : {}),
        ...(isNew ? { isNew: true } : {}),
        ...(isBackoffice ? { isBackoffice: true } : {}),
        ...(feature.notes ? { notes: feature.notes } : {}),
      });
      totalFeatures++;
    }
  }

  return { modules, totalFeatures };
}

function inferComplexity(hours: number): Complexity {
  if (hours <= 0) return "M";
  if (hours <= 4) return "P";
  if (hours <= 10) return "M";
  if (hours <= 20) return "G";
  return "XG";
}

/**
 * Merges the freshly parsed sheet modules into existing data. Project params
 * (rate, stack, approach) and any locally-set complexity are preserved; the
 * sheet drives names, decisions, hours and notes.
 */
export function mergeSheetIntoData(
  existing: MvpData,
  sheetModules: Module[]
): MvpData {
  const prevByCode = new Map<string, Feature>();
  for (const m of existing.modules) {
    for (const f of m.features) {
      if (f.code) prevByCode.set(f.code, f);
    }
  }

  const modules = sheetModules.map((mod) => {
    const prevMod = existing.modules.find((m) => m.id === mod.id);
    return {
      ...mod,
      description: prevMod?.description ?? mod.description,
      features: mod.features.map((f) => {
        const prev = f.code ? prevByCode.get(f.code) : undefined;
        // Keep a manually-tuned complexity if the user set one before.
        return prev?.complexity && prev.complexity !== inferComplexity(f.hours)
          ? { ...f, complexity: prev.complexity }
          : f;
      }),
    };
  });

  return {
    ...existing,
    project: { ...existing.project, lastSyncedAt: new Date().toISOString() },
    modules,
  };
}
