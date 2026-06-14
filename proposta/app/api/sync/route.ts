import { NextResponse } from "next/server";
import { getMvpData, saveMvpData, ValidationError } from "@/lib/data";
import {
  buildCsvUrl,
  csvToMvp,
  mergeSheetIntoData,
  DEFAULT_SHEET_ID,
  DEFAULT_SHEET_GID,
} from "@/lib/sheet";

/**
 * Pulls the latest state from the public Google Sheet (CSV export), merges it
 * into the local proposal and persists the result to data/mvp.json.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let sheetId = DEFAULT_SHEET_ID;
  let gid = DEFAULT_SHEET_GID;

  try {
    const existing = await getMvpData();
    sheetId = existing.project.sheetId || sheetId;
    gid = existing.project.sheetGid || gid;

    // Allow overriding via body without failing if there's no body.
    try {
      const body = (await request.json()) as { sheetId?: string; gid?: string };
      if (body?.sheetId) sheetId = body.sheetId;
      if (body?.gid) gid = body.gid;
    } catch {
      /* no body provided — use stored/default values */
    }

    const url = buildCsvUrl(sheetId, gid);
    const res = await fetch(url, { cache: "no-store", redirect: "follow" });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `A planilha respondeu ${res.status}. Verifique se está pública (Qualquer pessoa com o link · Leitor).`,
        },
        { status: 502 }
      );
    }

    const csv = await res.text();
    if (csv.trimStart().startsWith("<")) {
      return NextResponse.json(
        {
          error:
            "A planilha não está acessível publicamente (retornou HTML de login). Ajuste o compartilhamento para 'Qualquer pessoa com o link'.",
        },
        { status: 502 }
      );
    }

    const { modules, totalFeatures } = csvToMvp(csv);
    if (modules.length === 0) {
      return NextResponse.json(
        { error: "Nenhum módulo reconhecido na planilha. Confira o layout das colunas." },
        { status: 422 }
      );
    }

    const merged = mergeSheetIntoData(
      { ...existing, project: { ...existing.project, sheetId, sheetGid: gid } },
      modules
    );
    const saved = await saveMvpData(merged);

    return NextResponse.json({
      data: saved,
      stats: { modules: modules.length, features: totalFeatures },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Falha ao sincronizar com a planilha." },
      { status: 500 }
    );
  }
}
