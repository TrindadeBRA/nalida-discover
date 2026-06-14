import { NextResponse } from "next/server";
import { getMvpData, saveMvpData, ValidationError } from "@/lib/data";

/**
 * Node API route (runtime: nodejs) that serves and persists the MVP scope JSON.
 * The frontend consumes/edits this endpoint instead of talking to a database.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMvpData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar o escopo do MVP." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido no corpo da requisição." }, { status: 400 });
  }

  try {
    const saved = await saveMvpData(payload);
    return NextResponse.json(saved);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Não foi possível salvar o escopo do MVP." },
      { status: 500 }
    );
  }
}
