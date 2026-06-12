import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { currentPlayer } from "@/lib/session";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function RankingPage() {
  const player = await currentPlayer();
  if (!player) redirect("/");

  const db = await getDb();
  const { rows } = await db.query(
    `SELECT p.id, p.name,
            COUNT(*) FILTER (
              WHERE (m.team1 = 'Brazil' OR m.team2 = 'Brazil')
                AND m.score1 IS NOT NULL AND m.score2 IS NOT NULL
                AND pr.pred1 = m.score1 AND pr.pred2 = m.score2
            )::int AS hits,
            COUNT(pr.match_id) FILTER (
              WHERE m.team1 = 'Brazil' OR m.team2 = 'Brazil'
            )::int AS total_preds
     FROM players p
     LEFT JOIN predictions pr ON pr.player_id = p.id
     LEFT JOIN matches m ON m.id = pr.match_id
     GROUP BY p.id, p.name
     ORDER BY hits DESC, p.name ASC`
  );

  // Posição com empate: mesmo nº de acertos = mesma posição
  let pos = 0;
  let lastHits = -1;
  const ranked = rows.map((r, i) => {
    const hits = r.hits as number;
    if (hits !== lastHits) {
      pos = i + 1;
      lastHits = hits;
    }
    return {
      id: r.id as number,
      name: r.name as string,
      hits,
      total_preds: r.total_preds as number,
      pos,
    };
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Ranking</h1>
      <p className="text-sm text-emerald-400 mb-6">1 ponto por placar exato.</p>
      <div className="rounded-xl overflow-hidden border border-emerald-800">
        <table className="w-full text-sm">
          <thead className="bg-emerald-900 text-emerald-300">
            <tr>
              <th className="text-left px-4 py-2.5 w-12">#</th>
              <th className="text-left px-4 py-2.5">Participante</th>
              <th className="text-right px-4 py-2.5">Acertos</th>
              <th className="text-right px-4 py-2.5">Palpites</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r) => (
              <tr
                key={r.id}
                className={`border-t border-emerald-800/60 ${
                  r.id === player.id ? "bg-amber-400/10" : "odd:bg-emerald-900/30"
                }`}
              >
                <td className="px-4 py-2.5">{MEDALS[r.pos - 1] ?? r.pos}</td>
                <td className="px-4 py-2.5 font-medium">
                  {r.name}
                  {r.id === player.id && (
                    <span className="text-amber-300 text-xs ml-2">(você)</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right font-bold tabular-nums text-amber-300">
                  {r.hits}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-emerald-400">
                  {r.total_preds}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
