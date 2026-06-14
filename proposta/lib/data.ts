import { promises as fs } from "fs";
import path from "path";
import type { Decision, Complexity, MvpData } from "./types";

export { summarizeModule, computeTotals, formatCurrency } from "./compute";

const DATA_FILE = path.join(process.cwd(), "data", "mvp.json");

/**
 * Reads the MVP scope from the JSON file. No database is used — the JSON file
 * served from disk is the single source of truth for the proposal.
 */
export async function getMvpData(): Promise<MvpData> {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as MvpData;
}

/**
 * Persists the MVP scope back to disk after validating its shape. Writes are
 * pretty-printed so the JSON stays human-readable and diff-friendly in git.
 */
export async function saveMvpData(data: unknown): Promise<MvpData> {
  const validated = validateMvpData(data);
  await fs.writeFile(DATA_FILE, JSON.stringify(validated, null, 2) + "\n", "utf-8");
  return validated;
}

const DECISIONS: Decision[] = ["included", "deferred", "removed"];
const COMPLEXITIES: Complexity[] = ["P", "M", "G", "XG"];

function fail(message: string): never {
  throw new ValidationError(message);
}

export class ValidationError extends Error {}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string") fail(`Campo "${field}" deve ser texto.`);
  return value;
}

function asNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    fail(`Campo "${field}" deve ser um número.`);
  }
  return value;
}

/**
 * Defensive validation of the incoming payload. Keeps the persisted JSON
 * well-formed even though edits arrive from the browser.
 */
export function validateMvpData(data: unknown): MvpData {
  if (typeof data !== "object" || data === null) fail("Payload inválido.");
  const d = data as Record<string, unknown>;

  const project = d.project as Record<string, unknown>;
  if (!project) fail('Campo "project" ausente.');

  const stack = Array.isArray(project.stack)
    ? project.stack.map((s, i) => asString(s, `project.stack[${i}]`))
    : [];

  const legend = (d.legend ?? {}) as Record<string, unknown>;

  if (!Array.isArray(d.modules)) fail('Campo "modules" deve ser uma lista.');

  const modules = d.modules.map((m, mi) => {
    const mod = m as Record<string, unknown>;
    if (!Array.isArray(mod.features)) {
      fail(`Módulo [${mi}] precisa de uma lista "features".`);
    }
    return {
      id: asString(mod.id, `modules[${mi}].id`),
      name: asString(mod.name, `modules[${mi}].name`),
      description: typeof mod.description === "string" ? mod.description : "",
      features: mod.features.map((f, fi) => {
        const feat = f as Record<string, unknown>;
        const decision = asString(feat.decision, `feature[${mi}.${fi}].decision`);
        if (!DECISIONS.includes(decision as Decision)) {
          fail(`Decisão inválida: "${decision}".`);
        }
        const complexity = asString(
          feat.complexity ?? "M",
          `feature[${mi}.${fi}].complexity`
        );
        if (!COMPLEXITIES.includes(complexity as Complexity)) {
          fail(`Complexidade inválida: "${complexity}".`);
        }
        const hours = asNumber(feat.hours ?? 0, `feature[${mi}.${fi}].hours`);
        if (hours < 0) fail("Horas não podem ser negativas.");
        return {
          ...(typeof feat.code === "string" && feat.code ? { code: feat.code } : {}),
          name: asString(feat.name, `feature[${mi}.${fi}].name`),
          decision: decision as Decision,
          complexity: complexity as Complexity,
          hours,
          ...(feat.isNew === true ? { isNew: true } : {}),
          ...(feat.isBackoffice === true ? { isBackoffice: true } : {}),
          ...(typeof feat.originalHours === "number" && feat.originalHours > 0
            ? { originalHours: feat.originalHours }
            : {}),
          ...(typeof feat.notes === "string" && feat.notes.trim()
            ? { notes: feat.notes }
            : {}),
        };
      }),
    };
  });

  return {
    project: {
      name: asString(project.name, "project.name"),
      subtitle: typeof project.subtitle === "string" ? project.subtitle : "",
      vendor: typeof project.vendor === "string" ? project.vendor : "",
      stack,
      approach: typeof project.approach === "string" ? project.approach : "",
      hourlyRate: asNumber(project.hourlyRate ?? 0, "project.hourlyRate"),
      hoursPerDay: asNumber(project.hoursPerDay ?? 1, "project.hoursPerDay"),
      currency: typeof project.currency === "string" ? project.currency : "BRL",
      ...(typeof project.sheetId === "string" ? { sheetId: project.sheetId } : {}),
      ...(typeof project.sheetGid === "string" ? { sheetGid: project.sheetGid } : {}),
      ...(typeof project.lastSyncedAt === "string"
        ? { lastSyncedAt: project.lastSyncedAt }
        : {}),
    },
    legend: {
      included: typeof legend.included === "string" ? legend.included : "",
      deferred: typeof legend.deferred === "string" ? legend.deferred : "",
      removed: typeof legend.removed === "string" ? legend.removed : "",
    },
    modules,
  };
}
