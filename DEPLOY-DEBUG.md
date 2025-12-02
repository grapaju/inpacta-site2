# Novo fluxo de deploy (VPS + aaPanel)

Este documento descreve como fazer deploy do site na nossa VPS usando aaPanel, Nginx e PM2, substituindo a Vercel.

## Pré-requisitos
- Node.js LTS (v18+ ou v20) instalado no servidor.
- PM2 instalado globalmente: `npm i -g pm2`.
- Banco PostgreSQL acessível e variáveis de ambiente definidas.
- aaPanel com Nginx habilitado.

## Variáveis de ambiente
Crie o arquivo `.env.production` na raiz do projeto (no servidor) contendo, por exemplo:
```
DATABASE_URL=postgresql://usuario:senha@host:5432/db
NEXTAUTH_URL=https://seu-dominio
NEXTAUTH_SECRET=uma_chave_segura
# outras variáveis necessárias pelo projeto
```

## Build de produção
No servidor:
1. `npm ci`
2. `npm run build` (gera saída standalone para produção)
3. `npm run db:migrate` (aplica migrações Prisma)
4. `npm run db:seed` (opcional, conforme necessidade)

## Rodar com PM2
Use o arquivo `scripts/pm2.config.js`:
```
pm2 start scripts/pm2.config.js --env production
pm2 status
pm2 save
```
Para atualizar:
```
pm2 restart inpacta-site
```

## Nginx (aaPanel)
Crie um site no aaPanel apontando para seu domínio e configure o reverse proxy para o Node na porta 3000:
```
location / {
	proxy_pass http://127.0.0.1:3000;
	proxy_http_version 1.1;
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection 'upgrade';
	proxy_set_header Host $host;
	proxy_cache_bypass $http_upgrade;
}

# Opcional: servir estáticos diretamente
location /_next/static/ {
	proxy_pass http://127.0.0.1:3000;
	add_header Cache-Control "public, max-age=31536000, immutable";
}
```
Habilite HTTPS (Let’s Encrypt) pelo aaPanel.

## Observações
- O arquivo `vercel.json` deixa de ter efeito na VPS.
- `next.config.mjs` usa `output: 'standalone'` para simplificar execução.
- Monitoramento: configure PM2 logs (`pm2 logs inpacta-site`).
- Em caso de erro, valide `.env.production`, migrações Prisma e permissões.