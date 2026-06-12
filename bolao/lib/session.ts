import { cookies } from "next/headers";
import { getDb } from "./db";

export interface Player {
  id: number;
  name: string;
}

export async function currentPlayer(): Promise<Player | null> {
  const store = await cookies();
  const id = store.get("player_id")?.value;
  if (!id || !/^\d+$/.test(id)) return null;
  const db = await getDb();
  const { rows } = await db.query(`SELECT id, name FROM players WHERE id = $1`, [Number(id)]);
  return rows.length ? (rows[0] as unknown as Player) : null;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get("bolao_admin")?.value === "1";
}

export function adminPin(): string {
  return process.env.ADMIN_PIN ?? "gpaa2026";
}
