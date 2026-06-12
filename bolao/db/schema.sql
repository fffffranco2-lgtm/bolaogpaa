-- Schema do Bolão da Copa 2026
-- Espelha o init() de lib/db.ts. O app cria estas tabelas automaticamente
-- na primeira requisição (getDb -> init), então rodar este arquivo é OPCIONAL —
-- útil apenas para preparar/inspecionar o banco no SQL Editor do Supabase.

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

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
);

CREATE TABLE IF NOT EXISTS predictions (
  player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  pred1 INT NOT NULL,
  pred2 INT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (player_id, match_id)
);

-- A carga inicial dos jogos (data/worldcup2026.json) é feita automaticamente
-- pelo init() do app na primeira requisição.
