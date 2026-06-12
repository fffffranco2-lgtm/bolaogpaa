import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { currentPlayer } from "@/lib/session";
import { roundLabel, teamLabel } from "@/lib/teams";
import MatchCard, { type MatchView } from "./match-card";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "long",
  day: "2-digit",
  month: "long",
});
const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function JogosPage() {
  const player = await currentPlayer();
  if (!player) redirect("/");

  const db = await getDb();
  const { rows } = await db.query(
    `SELECT m.id, m.round, m.group_name, m.team1, m.team2, m.kickoff, m.venue,
            m.score1, m.score2, p.pred1, p.pred2
     FROM matches m
     LEFT JOIN predictions p ON p.match_id = m.id AND p.player_id = $1
     WHERE m.team1 = 'Brazil' OR m.team2 = 'Brazil'
     ORDER BY m.kickoff, m.id`,
    [player.id]
  );

  const now = new Date();
  const byDay = new Map<string, MatchView[]>();
  for (const r of rows) {
    const kickoff = new Date(r.kickoff as string);
    const t1 = teamLabel(r.team1 as string);
    const t2 = teamLabel(r.team2 as string);
    const view: MatchView = {
      id: r.id as number,
      roundLabel: roundLabel(r.round as string, r.group_name as string | null),
      team1: t1.name,
      flag1: t1.flag,
      team2: t2.name,
      flag2: t2.flag,
      time: timeFmt.format(kickoff),
      venue: r.venue as string | null,
      locked: kickoff <= now,
      score1: r.score1 as number | null,
      score2: r.score2 as number | null,
      pred1: r.pred1 as number | null,
      pred2: r.pred2 as number | null,
    };
    const day = dateFmt.format(kickoff);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(view);
  }

  const days = [...byDay.entries()];
  const firstOpenDay = days.findIndex(([, ms]) => ms.some((m) => !m.locked));

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Jogos do Brasil 🇧🇷</h1>
      <p className="text-sm text-emerald-400 mb-6">
        Horários de Brasília. Palpites travam no início de cada jogo — só placar exato pontua. 🎯
        Os jogos do mata-mata aparecem quando o Brasil se classificar.
      </p>
      <div className="space-y-8">
        {days.map(([day, matches], i) => (
          <details key={day} open={i >= firstOpenDay}>
            <summary className="cursor-pointer text-amber-300 font-semibold capitalize mb-3 select-none">
              {day}
            </summary>
            <div className="space-y-3">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
