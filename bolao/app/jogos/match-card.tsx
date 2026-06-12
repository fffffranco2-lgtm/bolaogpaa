"use client";

import { useState, useTransition } from "react";
import { savePrediction } from "../actions";

export interface MatchView {
  id: number;
  roundLabel: string;
  team1: string;
  flag1: string;
  team2: string;
  flag2: string;
  time: string;
  venue: string | null;
  locked: boolean;
  score1: number | null;
  score2: number | null;
  pred1: number | null;
  pred2: number | null;
}

export default function MatchCard({ match }: { match: MatchView }) {
  const [p1, setP1] = useState(match.pred1 != null ? String(match.pred1) : "");
  const [p2, setP2] = useState(match.pred2 != null ? String(match.pred2) : "");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const finished = match.score1 != null && match.score2 != null;
  const hit =
    finished &&
    match.pred1 != null &&
    match.pred1 === match.score1 &&
    match.pred2 === match.score2;

  function save() {
    if (p1 === "" || p2 === "") return;
    startTransition(async () => {
      const res = await savePrediction(match.id, Number(p1), Number(p2));
      if (res.ok) {
        setStatus("saved");
      } else {
        setStatus("error");
        setErrorMsg(res.error ?? "Erro ao salvar.");
      }
    });
  }

  return (
    <div className="rounded-xl bg-emerald-900/60 border border-emerald-800 p-4">
      <div className="flex items-center justify-between text-xs text-emerald-400 mb-2">
        <span>{match.roundLabel}</span>
        <span>
          {match.time}
          {match.venue ? ` · ${match.venue}` : ""}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="text-right font-medium truncate">
          {match.team1} <span className="text-lg">{match.flag1}</span>
        </div>

        {match.locked ? (
          <div className="text-xl font-bold tabular-nums px-3">
            {finished ? `${match.score1} × ${match.score2}` : "—"}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={99}
              value={p1}
              onChange={(e) => {
                setP1(e.target.value);
                setStatus("idle");
              }}
              className="w-12 text-center rounded-md bg-emerald-950 border border-emerald-700 py-1.5 focus:outline-none focus:border-amber-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-emerald-500">×</span>
            <input
              type="number"
              min={0}
              max={99}
              value={p2}
              onChange={(e) => {
                setP2(e.target.value);
                setStatus("idle");
              }}
              className="w-12 text-center rounded-md bg-emerald-950 border border-emerald-700 py-1.5 focus:outline-none focus:border-amber-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        )}

        <div className="text-left font-medium truncate">
          <span className="text-lg">{match.flag2}</span> {match.team2}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-3 text-sm min-h-6">
        {match.locked ? (
          match.pred1 != null ? (
            <span className={hit ? "text-amber-300 font-semibold" : "text-emerald-400"}>
              Seu palpite: {match.pred1} × {match.pred2}{" "}
              {finished && (hit ? "🎯 Acertou!" : "✗")}
            </span>
          ) : (
            <span className="text-emerald-600">Sem palpite</span>
          )
        ) : (
          <>
            <button
              onClick={save}
              disabled={isPending || p1 === "" || p2 === ""}
              className="rounded-md bg-amber-400 text-emerald-950 font-semibold px-4 py-1 text-sm hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? "Salvando..." : "Salvar palpite"}
            </button>
            {status === "saved" && <span className="text-emerald-300">Salvo ✓</span>}
            {status === "error" && <span className="text-red-400">{errorMsg}</span>}
          </>
        )}
      </div>
    </div>
  );
}
