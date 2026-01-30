# Guia de Instalação do Banco de Dados no aaPanel

## 📋 Índice
1. [Instalação do PostgreSQL no aaPanel](#1-instalação-do-postgresql-no-aapanel)
2. [Criação do Banco de Dados](#2-criação-do-banco-de-dados)
3. [Configuração do Projeto](#3-configuração-do-projeto)
4. [Migração dos Dados (se necessário)](#4-migração-dos-dados)
5. [Alternativa: MySQL](#5-alternativa-mysql)

---

## 1. Instalação do PostgreSQL no aaPanel

### Passo 1: Acessar o aaPanel
1. Acesse seu painel: `http://seu-servidor:7800` ou `https://seu-servidor:7800`
2. Faça login com suas credenciais

### Passo 2: Instalar PostgreSQL
1. Vá em **App Store** (loja de aplicativos)
2. Busque por **PostgreSQL**
3. Clique em **Install** e escolha a versão (recomendado: **14.x** ou **15.x**)
4. Aguarde a instalação (pode levar alguns minutos)

### Passo 3: Verificar a Instalação
1. Após instalar, vá em **Database** no menu lateral
2. Você verá a opção **PostgreSQL** disponível
3. O serviço deve estar **Running** (verde)

---

## 2. Criação do Banco de Dados

### Opção A: Via Interface do aaPanel (Recomendado)

1. **Acessar PostgreSQL**:
   - Menu lateral → **Database** → **PostgreSQL**

2. **Criar Banco de Dados**:
   - Clique em **Add database**
   - Preencha:
     - **Database Name**: `inpacta_db` (ou outro nome de sua escolha)
     - **Username**: `inpacta_user`
     - **Password**: Gere uma senha forte (clique no ícone de chave)
     - **Access Permission**: `Local Server` (127.0.0.1) - mais seguro
   - Clique em **Submit**

3. **Anotar Credenciais**:
   - Nome do banco: `inpacta_db`
   - Usuário: `inpacta_user`
   - Senha: (a senha que você definiu)
   - Host: `localhost` ou `127.0.0.1`
   - Porta: `5432` (padrão PostgreSQL)

### Opção B: Via Terminal SSH

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Criar usuário
CREATE USER inpacta_user WITH PASSWORD 'sua_senha_forte_aqui';

# Criar banco de dados
CREATE DATABASE inpacta_db OWNER inpacta_user;

# Dar permissões
GRANT ALL PRIVILEGES ON DATABASE inpacta_db TO inpacta_user;

# Sair
\q
```

---

## 3. Configuração do Projeto

### Passo 1: Configurar Variáveis de Ambiente

⚠️ **Importante sobre Node Projects no aaPanel**:
- Sites PHP/HTML vão em **Website** (hospedam arquivos estáticos)
- Sites Node/React vão em **Node Projects** (executam aplicações)
- **Node Projects NÃO tem configuração de variáveis por projeto no painel**

Você tem 2 opções:

#### Opção 1: Via Node Manager (Global - se tiver só 1 projeto)
1. Vá em **App Store** → **Node Manager**
2. Localize a **versão do Node** que seu projeto Node usa (ex: v20.x)
3. Clique em **Settings** (ícone de engrenagem)
4. Procure por **Environment Variables** ou **Env Variables**
5. Adicione cada variável:
   - `DATABASE_URL` = `postgresql://inpacta_user:sua_senha@localhost:5432/inpacta_db`
   - `NEXTAUTH_URL` = `https://inpacta.org.br`
   - `NEXTAUTH_SECRET` = `OQpOJC/uSngX31lgb/h2T3hyJq929F+1PF5hbppzRMEzJTTNMG1Jn5eqOh4=`
   - `NEXT_PUBLIC_SHOW_SPECIALIZED_TEAMS` = `false`

6. Clique em **Save**
7. Reinicie seu Node Project

⚠️ **ATENÇÃO**: Essas variáveis são **globais** para **TODOS os projetos Node** que usam essa versão do Node. Se você criar um segundo projeto Node, ele também verá essas mesmas variáveis!

#### Opção 2: Via Arquivo .env.production (Recomendado para múltiplos projetos)

Crie um arquivo `.env.production` na pasta raiz do seu projeto:

**Via SSH:**
```bash
cd /www/wwwroot/inpacta.org.br
nano .env.production
```

**Ou via File Manager do aaPanel:**
1. **File** → Navegue até `/www/wwwroot/inpacta.org.br`
2. **Create File** → Nome: `.env.production`
3. **Edit** → Cole o conteúdo abaixo

**Conteúdo do arquivo:**
```env
DATABASE_URL=postgresql://inpacta_user:sua_senha@localhost:5432/inpacta_db
NEXTAUTH_URL=https://inpacta.org.br
NEXTAUTH_SECRET=OQpOJC/uSngX31lgb/h2T3hyJq929F+1PF5hbppzRMEzJTTNMG1Jn5eqOh4=
NEXT_PUBLIC_SHOW_SPECIALIZED_TEAMS=false
```

Salve e reinicie o Node Project.

✅ **Vantagens**:
- Cada projeto tem suas próprias variáveis (isoladas)
- Não afeta outros projetos Node
- Fácil de versionar (mas nunca commite senhas!)

❌ **Desvantagens**:
- Pode ser sobrescrito em deploy (adicione ao `.gitignore`)
- Precisa criar/editar manualmente

### Passo 2: Executar Migrações

```bash
# Conectar via SSH
ssh usuario@seu-servidor

# Ir para pasta do projeto
cd /www/wwwroot/inpacta.org.br

# Executar migrações
npm run db:migrate

# Criar usuário admin (primeiro acesso)
npm run db:seed
```

### Passo 3: Build e Restart

```bash
# Build da aplicação
npm run build

# Reiniciar no aaPanel
# Vá em: Website → Seu site → Node Project → Restart
```

Ou use o comando combinado:
```bash
npm run deploy:aapanel
```

---

## 4. Migração dos Dados (se necessário)

### Se você já tem dados no Neon e quer migrar:

#### Opção 1: Export/Import via pg_dump

**No servidor Neon (origem):**
```bash
# Exportar dados
pg_dump "postgresql://neondb_owner:npg_OhrB3YE9FRsJ@ep-dawn-thunder-adxnnbgv.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" > backup.sql
```

**No servidor aaPanel (destino):**
```bash
# Importar dados
psql -h localhost -U inpacta_user -d inpacta_db < backup.sql
```

#### Opção 2: Via Script Node.js

Crie um arquivo `scripts/migrate-from-neon.js`:

```javascript
const { PrismaClient } = require('@prisma/client')

// Conexão origem (Neon)
const prismaSource = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_SOURCE
    }
  }
})

// Conexão destino (aaPanel)
const prismaTarget = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function migrate() {
  try {
    // Migrar usuários
    const users = await prismaSource.user.findMany()
    for (const user of users) {
      await prismaTarget.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      })
    }
    
    // Migrar notícias
    const news = await prismaSource.news.findMany()
    for (const item of news) {
      await prismaTarget.news.upsert({
        where: { slug: item.slug },
        update: item,
        create: item
      })
    }
    
    // Migrar serviços
    const services = await prismaSource.service.findMany()
    for (const service of services) {
      await prismaTarget.service.upsert({
        where: { slug: service.slug },
        update: service,
        create: service
      })
    }
    
    console.log('✅ Migração concluída!')
  } catch (error) {
    console.error('❌ Erro na migração:', error)
  } finally {
    await prismaSource.$disconnect()
    await prismaTarget.$disconnect()
  }
}

migrate()
```

Execute:
```bash
DATABASE_URL_SOURCE="sua_url_neon" npm run migrate
```

---

## 5. Alternativa: MySQL

Se preferir usar MySQL ao invés de PostgreSQL:

### Instalar MySQL
1. **App Store** → **MySQL** → Instalar versão **8.0** ou **5.7**

### Criar Banco
1. **Database** → **MySQL** → **Add database**
   - Nome: `inpacta_db`
   - Usuário: `inpacta_user`
   - Senha: (gere uma senha forte)

### Alterar Schema do Prisma
Edite `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"  // Mudou de postgresql para mysql
  url      = env("DATABASE_URL")
}
```

### Ajustar DATABASE_URL
```env
DATABASE_URL=mysql://inpacta_user:senha@localhost:3306/inpacta_db
```

### Recriar Migrações
```bash
# Apagar migrações antigas
rm -rf prisma/migrations

# Criar nova migração para MySQL
npx prisma migrate dev --name init_mysql

# Ou em produção
npx prisma migrate deploy
```

---

## 🔐 Segurança

### Firewall PostgreSQL
Por padrão, o PostgreSQL no aaPanel só aceita conexões locais (127.0.0.1).

Se precisar acesso remoto:
1. **Database** → **PostgreSQL** → **Access Control**
2. Adicione IPs permitidos com cautela
3. Use sempre SSL quando possível

### Backup Automático
1. **Database** → **PostgreSQL** → Selecione o banco
2. **Backup** → Configure backup automático diário
3. Recomendado: Manter últimos 7 dias

---

## 🧪 Testar Conexão

### Via Node.js (SSH)
```bash
cd /www/wwwroot/inpacta.org.br
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ Conectado!')).catch(e => console.log('❌ Erro:', e))"
```

### Via psql (SSH)
```bash
psql -h localhost -U inpacta_user -d inpacta_db -c "SELECT version();"
```

---

## ❓ Solução de Problemas

### Erro: "Connection refused"
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar se necessário
sudo systemctl start postgresql
```

### Erro: "Authentication failed"
- Verifique usuário e senha na DATABASE_URL
- Confirme que o usuário tem permissões no banco

### Erro: Migrações falhando
```bash
# Reset completo (CUIDADO: apaga dados!)
npx prisma migrate reset

# Ou aplicar migrações manualmente
npx prisma migrate deploy
```

### Porta 5432 em uso
```bash
# Ver o que está usando a porta
sudo lsof -i :5432

# Ou verificar status
sudo systemctl status postgresql
```

---

## 📞 Próximos Passos

1. ✅ Instalar PostgreSQL no aaPanel
2. ✅ Criar banco de dados e usuário
3. ✅ Configurar `.env.production` ou variáveis do aaPanel
4. ✅ Executar migrações: `npm run db:migrate`
5. ✅ Criar admin: `npm run db:seed`
6. ✅ Build: `npm run build`
7. ✅ Testar: Acessar `https://inpacta.org.br/admin/login`

**Senha padrão do admin criado pelo seed:**
- Email: `admin@inpacta.org.br`
- Senha: (verifique no arquivo `scripts/setup-production.js`)

---

## 📚 Comandos Úteis

```bash
# Deploy completo (limpo)
npm run deploy:ci

# Deploy rápido (sem reinstalar)
npm run deploy:aapanel

# Apenas build
npm run build

# Ver logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Backup manual
pg_dump -h localhost -U inpacta_user inpacta_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -h localhost -U inpacta_user inpacta_db < backup_20241218.sql
```

---

**Boa sorte! 🚀**
