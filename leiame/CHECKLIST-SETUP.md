# ✅ Checklist Completo: Configuração do Banco no aaPanel

Use este checklist para garantir que todos os passos foram executados corretamente.

---

## 📅 ANTES DE COMEÇAR

### Informações Necessárias

- [ ] Acesso ao aaPanel: `https://seu-ip:7800`
- [ ] Credenciais de admin do aaPanel
- [ ] Acesso SSH ao servidor
- [ ] Domínio configurado: `inpacta.org.br`
- [ ] Projeto já no servidor em: `/www/wwwroot/inpacta.org.br`

---

## 🗄️ PARTE 1: INSTALAÇÃO DO POSTGRESQL (15 min)

### 1.1 Instalar PostgreSQL
- [ ] Login no aaPanel
- [ ] Ir em **App Store**
- [ ] Buscar "PostgreSQL"
- [ ] Clicar em **Install**
- [ ] Selecionar versão **14.x** ou **15.x**
- [ ] Aguardar instalação completa
- [ ] Verificar status: **Database** → **PostgreSQL** (deve estar verde/Running)

### 1.2 Criar Banco de Dados
- [ ] Menu **Database** → **PostgreSQL**
- [ ] Clicar em **Add database**
- [ ] Preencher:
  ```
  Database Name: inpacta_db
  Username: inpacta_user
  Password: [Gerar senha forte - ANOTE!]
  Access Permission: Local Server (127.0.0.1)
  ```
- [ ] Clicar em **Submit**
- [ ] Anotar credenciais em local seguro:
  ```
  Host: localhost
  Port: 5432
  Database: inpacta_db
  User: inpacta_user
  Password: _______________
  ```

### 1.3 Testar Conexão (via SSH)
```bash
psql -h localhost -U inpacta_user -d inpacta_db -c "SELECT version();"
```
- [ ] Comando executado com sucesso
- [ ] Versão do PostgreSQL exibida

---

## ⚙️ PARTE 2: CONFIGURAÇÃO DO PROJETO (10 min)

### 2.1 Conectar via SSH
```bash
ssh seu-usuario@seu-servidor
cd /www/wwwroot/inpacta.org.br
```
- [ ] Conectado ao servidor
- [ ] Dentro da pasta do projeto

### 2.2 Configurar Variáveis de Ambiente

**Opção A: Via aaPanel (Recomendado)**
- [ ] **Website** → Site → **Node Project**
- [ ] **Environment Variables**
- [ ] Adicionar cada variável:

```env
DATABASE_URL=postgresql://inpacta_user:SUA_SENHA@localhost:5432/inpacta_db
NEXTAUTH_URL=https://inpacta.org.br
NEXTAUTH_SECRET=OQpOJC/uSngX31lgb/h2T3hyJq929F+1PF5hbppzRMEzJTTNMG1Jn5eqOh4=
NEXT_PUBLIC_SHOW_SPECIALIZED_TEAMS=false
NODE_ENV=production
```

**Opção B: Arquivo .env.production (SSH)**
```bash
nano .env.production
# Colar as variáveis acima
# Salvar: Ctrl+O, Enter, Ctrl+X
```
- [ ] Variáveis configuradas
- [ ] **Substituir `SUA_SENHA`** pela senha real do banco

### 2.3 Verificar Arquivo
```bash
cat .env.production | grep DATABASE_URL
```
- [ ] DATABASE_URL aparece corretamente (sem placeholder)

---

## 🔄 PARTE 3: MIGRAÇÕES E SETUP (10 min)

### 3.1 Instalar Dependências
```bash
npm ci
```
- [ ] Instalação concluída sem erros
- [ ] Prisma Client gerado

### 3.2 Executar Migrações
```bash
npm run db:migrate
```
- [ ] Migrações aplicadas com sucesso
- [ ] Tabelas criadas (users, news, services, projects)

### 3.3 Verificar Tabelas
```bash
psql -h localhost -U inpacta_user -d inpacta_db -c "\dt"
```
- [ ] Tabelas listadas:
  - [ ] users
  - [ ] news
  - [ ] services
  - [ ] projects

### 3.4 Criar Usuário Admin
```bash
npm run db:seed
```
- [ ] Usuário admin criado
- [ ] **Anotar senha exibida no terminal!**

### 3.5 Verificar Admin
```bash
psql -h localhost -U inpacta_user -d inpacta_db -c "SELECT email, name FROM users;"
```
- [ ] Email `admin@inpacta.org.br` existe

---

## 🏗️ PARTE 4: BUILD E DEPLOY (5 min)

### 4.1 Build da Aplicação
```bash
npm run build
```
- [ ] Build concluído sem erros
- [ ] Pasta `.next` criada

### 4.2 Reiniciar Aplicação

**Opção A: Via aaPanel**
- [ ] **Website** → Site → **Node Project**
- [ ] Clicar em **Restart**
- [ ] Status muda para "Running"

**Opção B: Via PM2 (SSH)**
```bash
pm2 restart inpacta
```
- [ ] Aplicação reiniciada

### 4.3 Verificar Logs
```bash
pm2 logs inpacta --lines 50
```
- [ ] Sem erros críticos
- [ ] Mensagem "Server listening on port 3000" aparece

---

## 🧪 PARTE 5: TESTES (5 min)

### 5.1 Testar Site Público
- [ ] Abrir: `https://inpacta.org.br`
- [ ] Página carrega normalmente
- [ ] Sem erros 500/502

### 5.2 Testar Admin Login
- [ ] Abrir: `https://inpacta.org.br/admin/login`
- [ ] Página de login aparece
- [ ] Fazer login com:
  ```
  Email: admin@inpacta.org.br
  Senha: [senha anotada no passo 3.4]
  ```
- [ ] Login bem-sucedido
- [ ] Dashboard admin carrega

### 5.3 Testar CRUD (Criar Notícia)
- [ ] No admin, ir em **Notícias**
- [ ] Clicar em **Nova Notícia**
- [ ] Preencher campos de teste
- [ ] Salvar
- [ ] Notícia aparece na lista

### 5.4 Verificar no Banco
```bash
psql -h localhost -U inpacta_user -d inpacta_db -c "SELECT title FROM news LIMIT 5;"
```
- [ ] Notícia de teste aparece

---

## 🔒 PARTE 6: SEGURANÇA (10 min)

### 6.1 Firewall
- [ ] **Security** → **Firewall**
- [ ] Verificar portas:
  - [ ] 80 (HTTP): Allow
  - [ ] 443 (HTTPS): Allow
  - [ ] 5432 (PostgreSQL): **Deny** (bloquear acesso externo)
  - [ ] 3000 (Next.js): **Deny** (acesso apenas via Nginx)

### 6.2 SSL/HTTPS
- [ ] **Website** → Site → **SSL**
- [ ] **Let's Encrypt** → Apply
- [ ] Marcar **Force HTTPS**
- [ ] Marcar **Auto Renew**
- [ ] Certificado instalado
- [ ] Site acessível via `https://`

### 6.3 Permissões de Arquivos
```bash
chmod 600 .env.production
chown www:www -R /www/wwwroot/inpacta.org.br
```
- [ ] Permissões aplicadas

---

## 📦 PARTE 7: BACKUP AUTOMÁTICO (10 min)

### 7.1 Configurar Script de Backup
```bash
chmod +x scripts/backup.sh
nano scripts/backup.sh
```
- [ ] Tornar executável
- [ ] Editar linha `DB_PASSWORD="SUA_SENHA_AQUI"` com senha real
- [ ] Salvar

### 7.2 Criar Diretório de Backup
```bash
mkdir -p /www/backup/inpacta
```
- [ ] Diretório criado

### 7.3 Testar Backup Manual
```bash
./scripts/backup.sh
```
- [ ] Script executado sem erros
- [ ] Verificar arquivos:
```bash
ls -lh /www/backup/inpacta/
```
- [ ] Arquivo `db_*.sql.gz` existe
- [ ] Arquivo `uploads_*.tar.gz` existe (se houver uploads)

### 7.4 Agendar Backup Diário
```bash
crontab -e
```
Adicionar linha:
```
0 3 * * * /www/wwwroot/inpacta.org.br/scripts/backup.sh
```
- [ ] Cron configurado
- [ ] Backup agendado para 3h da manhã

### 7.5 Verificar Cron
```bash
crontab -l
```
- [ ] Linha do backup aparece

---

## 📊 PARTE 8: MONITORAMENTO (5 min)

### 8.1 Configurar Alertas no aaPanel
- [ ] **Monitoring** → **Settings**
- [ ] Configurar:
  - [ ] CPU > 80% → Alertar
  - [ ] RAM > 85% → Alertar
  - [ ] Disk > 90% → Alertar
  - [ ] SSL expira em < 30 dias → Alertar

### 8.2 Adicionar Email para Alertas
- [ ] **Settings** → **Email**
- [ ] Configurar SMTP
- [ ] Testar envio

---

## 🔧 PARTE 9: OTIMIZAÇÕES (Opcional - 15 min)

### 9.1 Nginx Cache (Arquivos Estáticos)
- [ ] **Website** → Site → **Site Configuration**
- [ ] Adicionar no bloco `location /`:

```nginx
location /_next/static/ {
    alias /www/wwwroot/inpacta.org.br/.next/static/;
    expires 1y;
    access_log off;
    add_header Cache-Control "public, immutable";
}

location /uploads/ {
    alias /www/wwwroot/inpacta.org.br/public/uploads/;
    expires 30d;
    access_log off;
}
```
- [ ] Salvar
- [ ] Reload Nginx

### 9.2 Compressão Gzip
- [ ] Verificar se está habilitado:
```nginx
gzip on;
gzip_vary on;
gzip_comp_level 6;
```
- [ ] Se não, adicionar no site configuration

### 9.3 PM2 Startup
```bash
pm2 startup
pm2 save
```
- [ ] PM2 configurado para iniciar no boot

---

## 🌐 PARTE 10: MIGRAÇÃO DE DADOS (Opcional)

**Apenas se você tem dados no Neon e quer migrar:**

### 10.1 Exportar do Neon
```bash
pg_dump "postgresql://neondb_owner:npg_OhrB3YE9FRsJ@ep-dawn-thunder-adxnnbgv.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" > backup.sql
```
- [ ] Backup criado

### 10.2 Importar no aaPanel
```bash
psql -h localhost -U inpacta_user -d inpacta_db < backup.sql
```
- [ ] Dados importados

**OU usar script:**
```bash
export DATABASE_URL_SOURCE="url_do_neon"
node scripts/migrate-from-neon.js
```
- [ ] Migração concluída

### 10.3 Verificar Dados
```bash
psql -h localhost -U inpacta_user -d inpacta_db -c "SELECT COUNT(*) FROM news;"
```
- [ ] Contagem correta de registros

---

## ✅ VERIFICAÇÃO FINAL

### Checklist Geral
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `inpacta_db` criado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações executadas
- [ ] Admin criado e testado
- [ ] Build concluído
- [ ] Aplicação reiniciada
- [ ] Site público acessível
- [ ] Admin login funcionando
- [ ] CRUD testado
- [ ] SSL/HTTPS ativo
- [ ] Firewall configurado
- [ ] Backup automático agendado
- [ ] Monitoramento ativo

### Comandos de Verificação Rápida
```bash
# Status PostgreSQL
sudo systemctl status postgresql

# Status aplicação
pm2 status

# Ver logs recentes
pm2 logs inpacta --lines 20

# Testar conexão banco
psql -h localhost -U inpacta_user -d inpacta_db -c "SELECT NOW();"

# Verificar backups
ls -lh /www/backup/inpacta/

# Ver crons
crontab -l
```

### URLs para Testar
- [ ] https://inpacta.org.br
- [ ] https://inpacta.org.br/noticias
- [ ] https://inpacta.org.br/admin/login
- [ ] https://inpacta.org.br/admin (após login)

---

## 📝 INFORMAÇÕES ANOTADAS

**Anote aqui para referência futura:**

```
===========================================
CREDENCIAIS DO BANCO DE DADOS
===========================================
Host: localhost
Port: 5432
Database: inpacta_db
User: inpacta_user
Password: _________________________

===========================================
ADMIN DO SITE
===========================================
URL: https://inpacta.org.br/admin/login
Email: admin@inpacta.org.br
Senha: _________________________

===========================================
AAPANEL
===========================================
URL: https://seu-ip:7800
User: _________________________
Password: _________________________

===========================================
SSH
===========================================
Host: _________________________
Port: 22
User: _________________________
Key/Pass: _________________________

===========================================
BACKUP
===========================================
Localização: /www/backup/inpacta/
Horário: 3h da manhã (diário)
Retenção: 30 dias

===========================================
```

---

## 🆘 SUPORTE

**Problemas comuns:**
- Ver: [AAPANEL-DATABASE-SETUP.md](./AAPANEL-DATABASE-SETUP.md) seção "Solução de Problemas"
- Logs: `pm2 logs inpacta`
- Verificar: [ARCHITECTURE.md](./ARCHITECTURE.md)

**Documentação:**
- [QUICKSTART-AAPANEL.md](./QUICKSTART-AAPANEL.md)
- [AAPANEL-CONFIG.md](./AAPANEL-CONFIG.md)
- [ADMIN-IMPROVEMENTS.md](./ADMIN-IMPROVEMENTS.md)

---

## 🎉 PARABÉNS!

Se todos os itens estão marcados, seu sistema está:
✅ Instalado
✅ Configurado
✅ Seguro
✅ Com backup
✅ Monitorado
✅ Otimizado

**Próximos passos:**
1. Começar a criar conteúdo no admin
2. Implementar melhorias (ver ADMIN-IMPROVEMENTS.md)
3. Monitorar logs e performance
4. Testar restauração de backup (importante!)

---

**Data de conclusão:** ___/___/______
**Responsável:** _____________________
