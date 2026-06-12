import worldcup from "@/data/worldcup2026.json";

// Camada de banco: Postgres (Neon) quando DATABASE_URL está definida (produção/Vercel),
// PGlite (Postgres embarcado, arquivo local) quando não está (desenvolvimento).
export interface DB {
  query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

const g = globalThis as unknown as { __bolaoDb?: Promise<DB> };

async function createDb(): Promise<DB> {
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return pool;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const pglite = new PGlite("./.pglite");
  return {
    query: async (text, params) => {
      const res = await pglite.query(text, params as unknown[]);
      return { rows: res.rows as Record<string, unknown>[] };
    },
  };
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

// "2026-06-11" + "13:00 UTC-6" -> Date em UTC
export function parseKickoff(date: string, time: string): Date {
  const m = time.match(/^(\d{2}:\d{2}) UTC([+-]\d+)(?::(\d{2}))?$/);
  if (!m) return new Date(`${date}T12:00:00Z`);
  const offsetH = parseInt(m[2], 10);
  const offsetMin = m[3] ? parseInt(m[3], 10) : 0;
  const sign = offsetH < 0 ? "-" : "+";
  const pad = String(Math.abs(offsetH)).padStart(2, "0");
  const padMin = String(offsetMin).padStart(2, "0");
  return new Date(`${date}T${m[1]}:00${sign}${pad}:${padMin}`);
}

export function matchKey(m: RawMatch): string {
  return m.num != null ? `m${m.num}` : `${m.group}|${m.team1}|${m.team2}`;
}

async function init(db: DB): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )`);
  await db.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      num INT,
      round TEXT NOT NULL,
      group_name TEXT,
      team1 TEXT NOT NULL,
      team2 TEXT NOT NULL,
      kickoff TIMESTAMPTZ NOT NULL,
      venue TEXT,
      score1 INT,
      score2 INT
    )`);
  await db.query(`
    CREATE TABLE IF NOT EXISTS predictions (
      player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      pred1 INT NOT NULL,
      pred2 INT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (player_id, match_id)
    )`);

  const { rows } = await db.query(`SELECT count(*)::int AS n FROM matches`);
  if ((rows[0].n as number) > 0) return;

  const matches = (worldcup as { matches: RawMatch[] }).matches;
  for (const m of matches) {
    const ft = m.score?.ft;
    await db.query(
      `INSERT INTO matches (key, num, round, group_name, team1, team2, kickoff, venue, score1, score2)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (key) DO NOTHING`,
      [
        matchKey(m),
        m.num ?? null,
        m.round,
        m.group ?? null,
        m.team1,
        m.team2,
        parseKickoff(m.date, m.time).toISOString(),
        m.ground ?? null,
        ft ? ft[0] : null,
        ft ? ft[1] : null,
      ]
    );
  }
}

export function getDb(): Promise<DB> {
  if (!g.__bolaoDb) {
    g.__bolaoDb = createDb().then(async (db) => {
      await init(db);
      return db;
    });
  }
  return g.__bolaoDb;
}
