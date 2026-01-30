# Deploy na VPS (aaPanel)

Este projeto não será mais publicado na Vercel. O novo fluxo de deploy usa aaPanel + Nginx. Caso use o módulo "Projeto NodeJS" do aaPanel (sem PM2), siga abaixo.

## Variáveis de ambiente
- Configure no aaPanel (Projeto NodeJS) ou crie `.env.production` na raiz com: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.

## Build e migrações (via SSH)
No servidor, dentro da pasta do projeto:
- `npm ci`
- `npm run db:migrate`
- `npm run build`
- `npm run db:seed` (se necessário)

Opcional:
- `npm run deploy:aapanel` para executar migrações + build em uma única etapa.
- `npm run deploy:fast` para apenas buildar (sem migrações) quando não houve mudanças de schema.
 - `npm run deploy:ci` para garantir instalação limpa + migrações + build em um único comando.

## Execução pelo aaPanel (Projeto NodeJS)
- Comando de inicialização: `npm run start`
- Porta da aplicação: `3000` (pode ajustar no aaPanel; o Next lerá `PORT` se definido)
- Ambiente: `production`

## Nginx (aaPanel)
- Configure o site com reverse proxy para `http://127.0.0.1:3000` e habilite HTTPS.
- Snippets e detalhes em `DEPLOY-DEBUG.md`.

## Usando Neon (PostgreSQL gerenciado)
- No aaPanel, defina `DATABASE_URL` com `sslmode=require`.
- Se usar o pooler do Neon (PgBouncer), em caso de erro nas migrações Prisma:
	- Defina temporariamente `DATABASE_URL_DIRECT` com a conexão direta (sem `-pooler`).
	- Rode `npm run deploy:neon` para aplicar migrações pela URL direta e buildar.
	- Volte a usar o pooler no runtime com `DATABASE_URL`.