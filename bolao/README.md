# ⚽ Bolão Copa GPAA

Site do bolão da Copa do Mundo 2026 do escritório.

## Como funciona

- O bolão é **só dos jogos do Brasil** 🇧🇷.
- Cada participante entra com o **nome** (sem senha) e palpita o **placar exato** de cada jogo.
- Os palpites **travam automaticamente** no horário de início de cada partida.
- **Pontuação**: 1 ponto por placar exato. O ranking atualiza em tempo real.
- A tabela da Copa 2026 já vem cadastrada (dados públicos do openfootball); os jogos do
  mata-mata do Brasil aparecem automaticamente quando os confrontos forem definidos
  (botão de importar resultados no admin).

## Páginas

| Página | O que faz |
|---|---|
| `/` | Login por nome |
| `/jogos` | Palpites, agrupados por dia (horário de Brasília) |
| `/ranking` | Classificação do bolão |
| `/admin` | Lançar resultados (protegido por PIN) |

## Administração

Acesse `/admin` e entre com o PIN (padrão `gpaa2026` — em produção defina a variável
de ambiente `ADMIN_PIN`). Lá você pode:

- **Importar resultados** com um clique (busca os placares reais no GitHub/openfootball,
  inclusive os classificados do mata-mata);
- Lançar ou corrigir resultados manualmente.

## Rodar localmente

Dê dois cliques em `dev.cmd` (ou rode `npm run dev`). O site abre em
<http://localhost:3000> e fica acessível na rede local pelo endereço que aparece no
terminal. Localmente não precisa de banco: usa PGlite (arquivo na pasta `.pglite`).

## Deploy no Vercel

Veja o passo a passo em [DEPLOY.md](DEPLOY.md).
