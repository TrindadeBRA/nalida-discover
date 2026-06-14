import type { Feature } from "./types";

/** Visual categories that mirror the spreadsheet's "Ação MVP" column. */
export type Category = "manter" | "remover" | "novo" | "adiar";

export const CATEGORY_LABEL: Record<Category, string> = {
  manter: "Manter",
  remover: "Remover",
  novo: "Novo",
  adiar: "Adiar",
};

/** Maps a feature to the same wording used in the Google Sheet. */
export function featureCategory(feature: Feature): Category {
  if (feature.isNew) return "novo";
  if (feature.decision === "removed") return "remover";
  if (feature.decision === "deferred") return "adiar";
  return "manter";
}
