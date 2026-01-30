# 🚀 Guia Rápido: aaPanel + Banco de Dados

## ⏱️ Instalação Rápida (30 minutos)

### 1️⃣ Instalar PostgreSQL no aaPanel (5 min)

1. **Acesse o aaPanel**: `https://seu-servidor:7800`
2. **App Store** → Buscar **"PostgreSQL"**
3. **Install** → Versão **14.x** ou **15.x**
4. Aguarde instalação

### 2️⃣ Criar Banco de Dados (3 min)

1. **Menu lateral** → **Database** → **PostgreSQL**
2. **Add database**:
   ```
   Database Name: inpacta_db
   Username: inpacta_user
   Password: [Gerar senha forte]
   Access Permission: Local Server (127.0.0.1)
   ```
3. **Submit**
4. ✅ **Anotar credenciais!**

### 3️⃣ Configurar Variáveis de Ambiente (2 min)

**Opção A: Via aaPanel (Recomendado)**
1. **Website** → Seu site → **Node Project**
2. **Environment Variables** → Adicionar:
   ```env
   DATABASE_URL=postgresql://inpacta_user:SUA_SENHA@localhost:5432/inpacta_db
   NEXTAUTH_URL=https://inpacta.org.br
   NEXTAUTH_SECRET=OQpOJC/uSngX31lgb/h2T3hyJq929F+1PF5hbppzRMEzJTTNMG1Jn5eqOh4=
   ```

**Opção B: Via SSH**
```bash
cd /www/wwwroot/inpacta.org.br
nano .env.production
# Colar as variáveis acima
# Salvar: Ctrl+O, Enter, Ctrl+X
```

### 4️⃣ Executar Migrações (5 min)

```bash
# Conectar via SSH
ssh seu-usuario@seu-servidor

# Ir para pasta do projeto
cd /www/wwwroot/inpacta.org.br

# Executar migrações
npm run db:migrate

# Criar usuário admin
npm run db:seed

# Build
npm run build
```

### 5️⃣ Reiniciar Aplicação (1 min)

**Opção A: Via aaPanel**
1. **Website** → Seu site → **Node Project**
2. **Restart**

**Opção B: Via SSH**
```bash
pm2 restart inpacta
```

### 6️⃣ Testar (2 min)

1. Acesse: `https://inpacta.org.br/admin/login`
2. Login:
   - Email: `admin@inpacta.org.br`
   - Senha: (verifique em `scripts/setup-production.js`)

---

## 🔄 Migrar Dados do Neon (Opcional - 10 min)

Se você já tem dados no Neon:

### Método 1: Via Script (Recomendado)

```bash
# Definir URL do Neon
export DATABASE_URL_SOURCE="postgresql://neondb_owner:npg_OhrB3YE9FRsJ@ep-dawn-thunder-adxnnbgv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Executar migração
node scripts/migrate-from-neon.js
```

### Método 2: Via pg_dump

```bash
# Exportar do Neon
pg_dump "postgresql://user:pass@neon.tech/db" > backup.sql

# Importar no aaPanel
psql -h localhost -U inpacta_user -d inpacta_db < backup.sql
```

---

## ⚡ Comandos Úteis

```bash
# Deploy completo (limpo)
npm run deploy:ci

# Deploy rápido
npm run deploy:aapanel

# Ver logs
pm2 logs inpacta

# Status do banco
sudo systemctl status postgresql

# Conectar ao banco
psql -h localhost -U inpacta_user -d inpacta_db
```

---

## 🔧 Solução de Problemas

### ❌ "Connection refused"
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### ❌ "Authentication failed"
- Verifique senha na `DATABASE_URL`
- Confirme usuário existe: `psql -U postgres -c "\du"`

### ❌ "Migration failed"
```bash
# Reset migrações (CUIDADO: apaga dados!)
npx prisma migrate reset

# Ou aplicar manualmente
npx prisma migrate deploy
```

### ❌ Aplicação não inicia
```bash
# Ver logs
pm2 logs inpacta --lines 100

# Verificar porta
lsof -i :3000

# Restart completo
pm2 delete inpacta
npm run start
```

---

## 📦 Configurar Backup Automático (5 min)

```bash
# Tornar script executável
chmod +x scripts/backup.sh

# Editar senha no script
nano scripts/backup.sh
# Alterar: DB_PASSWORD="SUA_SENHA_AQUI"

# Testar backup manual
./scripts/backup.sh

# Agendar backup diário às 3h
crontab -e
# Adicionar linha:
0 3 * * * /www/wwwroot/inpacta.org.br/scripts/backup.sh
```

---

## ✅ Checklist Final

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `inpacta_db` criado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações executadas (`npm run db:migrate`)
- [ ] Admin criado (`npm run db:seed`)
- [ ] Build concluído (`npm run build`)
- [ ] Aplicação reiniciada
- [ ] Login admin funcionando
- [ ] Backup automático configurado
- [ ] (Opcional) Dados migrados do Neon

---

## 📞 Precisa de Ajuda?

**Arquivos de Referência:**
- [AAPANEL-DATABASE-SETUP.md](./AAPANEL-DATABASE-SETUP.md) - Guia completo
- [ADMIN-IMPROVEMENTS.md](./ADMIN-IMPROVEMENTS.md) - Melhorias futuras
- [DEPLOY.md](./DEPLOY.md) - Deploy e produção

**Scripts Úteis:**
- `scripts/backup.sh` - Backup automático
- `scripts/restore.sh` - Restaurar backup
- `scripts/migrate-from-neon.js` - Migrar do Neon

---

**Tempo total estimado: 30-45 minutos** ⏱️

Boa sorte! 🎉
