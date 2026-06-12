import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/session";
import { roundLabel, teamLabel } from "@/lib/teams";
import { adminLogin, saveResult, syncFromOpenfootball } from "../actions";

export const dynamic = "force-dynamic";

const dtFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ sync?: string }>;
}) {
  const admin = await isAdmin();
  const { sync } = await searchParams;

  if (!admin) {
    return (
      <div className="max-w-sm mx-auto mt-12">
        <h1 className="text-xl font-bold mb-4 text-center">Área do administrador</h1>
        <form action={adminLogin} className="flex gap-2">
          <input
            type="password"
            name="pin"
            required
            placeholder="PIN do admin"
            className="flex-1 rounded-lg bg-emerald-900 border border-emerald-700 px-4 py-3 placeholder-emerald-500 focus:outline-none focus:border-amber-400"
          />
          <button className="rounded-lg bg-amber-400 text-emerald-950 font-semibold px-5 py-3 hover:bg-amber-300 cursor-pointer">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  const db = await getDb();
  const { rows } = await db.query(
    `SELECT id, round, group_name, team1, team2, kickoff, score1, score2
     FROM matches
     WHERE kickoff <= now() + interval '1 day'
       AND (team1 = 'Brazil' OR team2 = 'Brazil')
     ORDER BY kickoff DESC, id`
  );

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Administração</h1>

      <div className="rounded-xl bg-emerald-900/60 border border-emerald-800 p-4 mb-8">
        <h2 className="font-semibold mb-2">Importar resultados automaticamente</h2>
        <p className="text-sm text-emerald-400 mb-3">
          Busca placares e classificados do mata-mata na base pública openfootball (GitHub).
          Resultados já lançados manualmente não são apagados.
        </p>
        <form action={syncFromOpenfootball}>
          <button className="rounded-lg bg-amber-400 text-emerald-950 font-semibold px-4 py-2 text-sm hover:bg-amber-300 cursor-pointer">
            🔄 Importar resultados
          </button>
        </form>
        {sync === "ok" && <p className="text-emerald-300 text-sm mt-2">Importação concluída ✓</p>}
        {sync === "erro" && <p className="text-red-400 text-sm mt-2">Falha ao buscar dados. Tente de novo.</p>}
      </div>

      <h2 className="font-semibold mb-1">Lançar resultados manualmente</h2>
      <p className="text-sm text-emerald-400 mb-4">
        Jogos já iniciados (e os das próximas 24h), mais recentes primeiro. Deixe em branco e salve para limpar.
      </p>
      <div className="space-y-2">
        {rows.map((m) => {
          const t1 = teamLabel(m.team1 as string);
          const t2 = teamLabel(m.team2 as string);
          return (
            <form
              key={m.id as number}
              action={saveResult}
              className="rounded-lg bg-emerald-900/60 border border-emerald-800 px-4 py-3 grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"
            >
              <div className="min-w-0">
                <span className="text-emerald-500 text-xs block">
                  {roundLabel(m.round as string, m.group_name as string | null)} ·{" "}
                  {dtFmt.format(new Date(m.kickoff as string))}
                </span>
                <span className="truncate block">
                  {t1.flag} {t1.name} × {t2.name} {t2.flag}
                </span>
              </div>
              <input type="hidden" name="matchId" value={m.id as number} />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  name="score1"
                  min={0}
                  max={99}
                  defaultValue={m.score1 != null ? (m.score1 as number) : ""}
                  className="w-12 text-center rounded-md bg-emerald-950 border border-emerald-700 py-1"
                />
                <span className="text-emerald-500">×</span>
                <input
                  type="number"
                  name="score2"
                  min={0}
                  max={99}
                  defaultValue={m.score2 != null ? (m.score2 as number) : ""}
                  className="w-12 text-center rounded-md bg-emerald-950 border border-emerald-700 py-1"
                />
              </div>
              <button className="rounded-md bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 cursor-pointer">
                Salvar
              </button>
            </form>
          );
        })}
        {rows.length === 0 && (
          <p className="text-emerald-500 text-sm">Nenhum jogo iniciado ainda.</p>
        )}
      </div>
    </div>
  );
}
