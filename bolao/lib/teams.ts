// Nomes em português e bandeiras das 48 seleções (chave = nome em inglês do openfootball)
const TEAMS: Record<string, { pt: string; flag: string }> = {
  Algeria: { pt: "Argélia", flag: "🇩🇿" },
  Argentina: { pt: "Argentina", flag: "🇦🇷" },
  Australia: { pt: "Austrália", flag: "🇦🇺" },
  Austria: { pt: "Áustria", flag: "🇦🇹" },
  Belgium: { pt: "Bélgica", flag: "🇧🇪" },
  "Bosnia & Herzegovina": { pt: "Bósnia", flag: "🇧🇦" },
  Brazil: { pt: "Brasil", flag: "🇧🇷" },
  Canada: { pt: "Canadá", flag: "🇨🇦" },
  "Cape Verde": { pt: "Cabo Verde", flag: "🇨🇻" },
  Colombia: { pt: "Colômbia", flag: "🇨🇴" },
  Croatia: { pt: "Croácia", flag: "🇭🇷" },
  Curaçao: { pt: "Curaçao", flag: "🇨🇼" },
  "Czech Republic": { pt: "Tchéquia", flag: "🇨🇿" },
  "DR Congo": { pt: "RD Congo", flag: "🇨🇩" },
  Ecuador: { pt: "Equador", flag: "🇪🇨" },
  Egypt: { pt: "Egito", flag: "🇪🇬" },
  England: { pt: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  France: { pt: "França", flag: "🇫🇷" },
  Germany: { pt: "Alemanha", flag: "🇩🇪" },
  Ghana: { pt: "Gana", flag: "🇬🇭" },
  Haiti: { pt: "Haiti", flag: "🇭🇹" },
  Iran: { pt: "Irã", flag: "🇮🇷" },
  Iraq: { pt: "Iraque", flag: "🇮🇶" },
  "Ivory Coast": { pt: "Costa do Marfim", flag: "🇨🇮" },
  Japan: { pt: "Japão", flag: "🇯🇵" },
  Jordan: { pt: "Jordânia", flag: "🇯🇴" },
  Mexico: { pt: "México", flag: "🇲🇽" },
  Morocco: { pt: "Marrocos", flag: "🇲🇦" },
  Netherlands: { pt: "Holanda", flag: "🇳🇱" },
  "New Zealand": { pt: "Nova Zelândia", flag: "🇳🇿" },
  Norway: { pt: "Noruega", flag: "🇳🇴" },
  Panama: { pt: "Panamá", flag: "🇵🇦" },
  Paraguay: { pt: "Paraguai", flag: "🇵🇾" },
  Portugal: { pt: "Portugal", flag: "🇵🇹" },
  Qatar: { pt: "Catar", flag: "🇶🇦" },
  "Saudi Arabia": { pt: "Arábia Saudita", flag: "🇸🇦" },
  Scotland: { pt: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  Senegal: { pt: "Senegal", flag: "🇸🇳" },
  "South Africa": { pt: "África do Sul", flag: "🇿🇦" },
  "South Korea": { pt: "Coreia do Sul", flag: "🇰🇷" },
  Spain: { pt: "Espanha", flag: "🇪🇸" },
  Sweden: { pt: "Suécia", flag: "🇸🇪" },
  Switzerland: { pt: "Suíça", flag: "🇨🇭" },
  Tunisia: { pt: "Tunísia", flag: "🇹🇳" },
  Turkey: { pt: "Turquia", flag: "🇹🇷" },
  USA: { pt: "EUA", flag: "🇺🇸" },
  Uruguay: { pt: "Uruguai", flag: "🇺🇾" },
  Uzbekistan: { pt: "Uzbequistão", flag: "🇺🇿" },
};

const ROUNDS_PT: Record<string, string> = {
  "Round of 32": "16-avos de final",
  "Round of 16": "Oitavas de final",
  "Quarter-final": "Quartas de final",
  "Semi-final": "Semifinal",
  "Match for third place": "Disputa de 3º lugar",
  Final: "Final",
};

export function teamLabel(name: string): { name: string; flag: string } {
  const t = TEAMS[name];
  if (t) return { name: t.pt, flag: t.flag };

  // Placeholders do mata-mata: "1A" = 1º do Grupo A, "3A/B/C/D/F" = melhor 3º, "W73" = vencedor do jogo 73
  let m = name.match(/^([12])([A-L])$/);
  if (m) return { name: `${m[1]}º do Grupo ${m[2]}`, flag: "❓" };
  m = name.match(/^3([A-Z/]+)$/);
  if (m) return { name: `3º de ${m[1]}`, flag: "❓" };
  m = name.match(/^W(\d+)$/);
  if (m) return { name: `Venc. jogo ${m[1]}`, flag: "❓" };
  m = name.match(/^L(\d+)$/);
  if (m) return { name: `Perd. jogo ${m[1]}`, flag: "❓" };
  return { name, flag: "🏳️" };
}

export function isPlaceholder(name: string): boolean {
  return !TEAMS[name];
}

export function roundLabel(round: string, groupName: string | null): string {
  if (groupName) return groupName.replace("Group", "Grupo");
  return ROUNDS_PT[round] ?? round;
}
