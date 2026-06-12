import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { currentPlayer } from "@/lib/session";
import { login } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const player = await currentPlayer();
  if (player) redirect("/jogos");

  const db = await getDb();
  const { rows: players } = await db.query(`SELECT id, name FROM players ORDER BY name`);

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold text-center mb-2">Bolão da Copa 2026 🏆</h1>
      <p className="text-center text-emerald-300 mb-8">
        Palpite o placar exato dos jogos do Brasil 🇧🇷 e dispute o ranking do escritório!
      </p>

      <form action={login} className="flex gap-2 mb-8">
        <input
          name="name"
          required
          maxLength={40}
          placeholder="Seu nome"
          className="flex-1 rounded-lg bg-emerald-900 border border-emerald-700 px-4 py-3 placeholder-emerald-500 focus:outline-none focus:border-amber-400"
        />
        <button className="rounded-lg bg-amber-400 text-emerald-950 font-semibold px-5 py-3 hover:bg-amber-300 cursor-pointer">
          Entrar
        </button>
      </form>

      {players.length > 0 && (
        <div>
          <p className="text-sm text-emerald-400 mb-3">Ou entre com um nome já cadastrado:</p>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <form action={login} key={p.id as number}>
                <input type="hidden" name="name" value={p.name as string} />
                <button className="rounded-full bg-emerald-800 hover:bg-emerald-700 px-4 py-1.5 text-sm cursor-pointer">
                  {p.name as string}
                </button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
