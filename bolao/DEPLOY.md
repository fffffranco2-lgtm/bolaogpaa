# Deploy no Vercel — passo a passo

O site fica no ar de graça no Vercel, com banco Postgres gratuito (Neon).
Tempo estimado: ~10 minutos.

## 1. Criar a conta

1. Acesse <https://vercel.com/signup> e crie uma conta (pode usar o e-mail do trabalho).

## 2. Subir o projeto

No terminal (PowerShell), dentro da pasta `bolao`:

```powershell
npx vercel login    # faz login (manda um link pro seu e-mail)
npx vercel          # primeira publicação — aceite as opções padrão (Enter em tudo)
```

## 3. Criar o banco de dados

1. No painel do Vercel (<https://vercel.com/dashboard>), abra o projeto **bolao**.
2. Vá na aba **Storage** → **Create Database** → escolha **Neon** (Postgres) → plano Free.
3. Conecte ao projeto quando perguntado. Isso cria a variável `DATABASE_URL` automaticamente.

## 4. Definir o PIN do admin

1. No projeto, vá em **Settings** → **Environment Variables**.
2. Adicione: nome `ADMIN_PIN`, valor o PIN que você quiser (ex.: `gpaa2026`).

## 5. Publicar em produção

```powershell
npx vercel --prod
```

Pronto! O Vercel mostra a URL final (algo como `https://bolao-xxxx.vercel.app`).
É esse link que você manda pro pessoal do escritório. 🎉

Na primeira visita o banco é criado e os 104 jogos são cadastrados automaticamente.

## Manutenção durante a Copa

- Entre em `/admin` com o PIN e clique em **🔄 Importar resultados** depois dos jogos —
  os placares vêm sozinhos da base pública openfootball (atualizada por voluntários,
  normalmente em poucas horas). Se preferir, lance os placares manualmente na mesma tela.
- Quando os classificados do mata-mata forem definidos, o mesmo botão atualiza os
  confrontos automaticamente.
