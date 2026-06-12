"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb, matchKey, parseKickoff } from "@/lib/db";
import { adminPin, currentPlayer, isAdmin } from "@/lib/session";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 90, // 90 dias — cobre a Copa inteira
  path: "/",
};

export async function login(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 40);
  if (!name) return;
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO players (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name]
  );
  const store = await cookies();
  store.set("player_id", String(rows[0].id), COOKIE_OPTS);
  redirect("/jogos");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete("player_id");
  redirect("/");
}

export async function savePrediction(
  matchId: number,
  pred1: number,
  pred2: number
): Promise<{ ok: boolean; error?: string }> {
  const player = await currentPlayer();
  if (!player) return { ok: false, error: "Faça login novamente." };
  if (
    !Number.isInteger(pred1) || !Number.isInteger(pred2) ||
    pred1 < 0 || pred2 < 0 || pred1 > 99 || pred2 > 99
  ) {
    return { ok: false, error: "Placar inválido." };
  }
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT kickoff, team1, team2 FROM matches WHERE id = $1`,
    [matchId]
  );
  if (!rows.length) return { ok: false, error: "Jogo não encontrado." };
  if (rows[0].team1 !== "Brazil" && rows[0].team2 !== "Brazil") {
    return { ok: false, error: "O bolão é só de jogos do Brasil." };
  }
  if (new Date(rows[0].kickoff as string) <= new Date()) {
    return { ok: false, error: "Jogo já começou — palpite travado." };
  }
  await db.query(
    `INSERT INTO predictions (player_id, match_id, pred1, pred2, updated_at)
     VALUES ($1,$2,$3,$4,now())
     ON CONFLICT (player_id, match_id)
     DO UPDATE SET pred1 = $3, pred2 = $4, updated_at = now()`,
    [player.id, matchId, pred1, pred2]
  );
  revalidatePath("/jogos");
  return { ok: true };
}

export async function adminLogin(formData: FormData): Promise<void> {
  const pin = String(formData.get("pin") ?? "");
  if (pin === adminPin()) {
    const store = await cookies();
    store.set("bolao_admin", "1", COOKIE_OPTS);
  }
  redirect("/admin");
}

export async function saveResult(formData: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");
  const matchId = Number(formData.get("matchId"));
  const s1 = formData.get("score1");
  const s2 = formData.get("score2");
  const db = await getDb();
  if (s1 === "" || s2 === "" || s1 === null || s2 === null) {
    // Campos vazios = limpar resultado
    await db.query(`UPDATE matches SET score1 = NULL, score2 = NULL WHERE id = $1`, [matchId]);
  } else {
    const n1 = Number(s1), n2 = Number(s2);
    if (Number.isInteger(n1) && Number.isInteger(n2) && n1 >= 0 && n2 >= 0) {
      await db.query(`UPDATE matches SET score1 = $2, score2 = $3 WHERE id = $1`, [matchId, n1, n2]);
    }
  }
  revalidatePath("/jogos");
  revalidatePath("/ranking");
  revalidatePath("/admin");
}

interface RawMatch {
  round: string;
  num?: number;
  date: string;
  time: string;
  team1: string;
  team2: string;
  group?: string;
  ground?: string;
  score?: { ft?: [number, number] };
}

// Importa resultados e times definidos do mata-mata a partir do openfootball (dados públicos no GitHub)
export async function syncFromOpenfootball(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin");
  const res = await fetch(
    "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json",
    { cache: "no-store" }
  );
  if (!res.ok) redirect("/admin?sync=erro");
  const data = (await res.json()) as { matches: RawMatch[] };
  const db = await getDb();
  for (const m of data.matches) {
    const ft = m.score?.ft;
    await db.query(
      `UPDATE matches SET
         team1 = $2, team2 = $3, kickoff = $4,
         score1 = COALESCE($5, score1), score2 = COALESCE($6, score2)
       WHERE key = $1`,
      [
        matchKey(m),
        m.team1,
        m.team2,
        parseKickoff(m.date, m.time).toISOString(),
        ft ? ft[0] : null,
        ft ? ft[1] : null,
      ]
    );
  }
  revalidatePath("/jogos");
  revalidatePath("/ranking");
  redirect("/admin?sync=ok");
}
