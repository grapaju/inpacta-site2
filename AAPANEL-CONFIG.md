# Configuração do aaPanel para INPACTA

## 📋 Configurações Necessárias

### 1. Configuração do Projeto Node.js

**Caminho:** Website → inpacta.org.br → Node Project

```yaml
Project Name: inpacta
Project Path: /www/wwwroot/inpacta.org.br
Startup File: node_modules/next/dist/bin/next
Script: start
Port: 3000
Run Mode: production
Auto Start: Yes
```

### 2. Variáveis de Ambiente

```env
NODE_ENV=production
DATABASE_URL=postgresql://inpacta_user:SUA_SENHA@localhost:5432/inpacta_db
NEXTAUTH_URL=https://inpacta.org.br
NEXTAUTH_SECRET=OQpOJC/uSngX31lgb/h2T3hyJq929F+1PF5hbppzRMEzJTTNMG1Jn5eqOh4=
NEXT_PUBLIC_SHOW_SPECIALIZED_TEAMS=false
```

### 3. Configuração do Nginx

**Caminho:** Website → inpacta.org.br → Site Configuration

#### Reverse Proxy
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

#### Cache Estático (Opcional - para melhor performance)
```nginx
# Cache para arquivos estáticos do Next.js
location /_next/static/ {
    alias /www/wwwroot/inpacta.org.br/.next/static/;
    expires 1y;
    access_log off;
    add_header Cache-Control "public, immutable";
}

# Cache para uploads
location /uploads/ {
    alias /www/wwwroot/inpacta.org.br/public/uploads/;
    expires 30d;
    access_log off;
    add_header Cache-Control "public";
}
```

#### Limites de Upload
```nginx
# Dentro de server {}
client_max_body_size 50M;
client_body_timeout 60s;
```

#### Segurança (Adicionar no site configuration)
```nginx
# Bloquear acesso a arquivos sensíveis
location ~ /\. {
    deny all;
}

location ~ /(\.env|\.git|node_modules) {
    deny all;
}

# Headers de segurança
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 4. SSL/HTTPS

**Caminho:** Website → inpacta.org.br → SSL

1. **Let's Encrypt** (Grátis - Recomendado):
   - Clique em **Let's Encrypt**
   - Marque **Force HTTPS**
   - Marque **Auto Renew**
   - **Apply**

2. **Ou upload de certificado próprio**:
   - Upload do certificado `.crt`
   - Upload da chave privada `.key`

### 5. Configuração do PostgreSQL

**Caminho:** Database → PostgreSQL

```yaml
Version: 14.x ou 15.x
Port: 5432
Data Directory: /www/server/data/postgresql
Log: /www/server/postgresql/logs
```

#### Banco de Dados
```
Name: inpacta_db
User: inpacta_user
Password: [Senha forte gerada]
Encoding: UTF8
Collation: pt_BR.UTF-8
```

#### Configurações de Performance (postgresql.conf)
```ini
# Memória
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 128MB

# Conexões
max_connections = 100

# Logging (para debug)
log_statement = 'all'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d '

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
```

### 6. Firewall

**Caminho:** Security → Firewall

```
Porta 80 (HTTP): Allow
Porta 443 (HTTPS): Allow
Porta 7800 (aaPanel): Allow (apenas seu IP)
Porta 5432 (PostgreSQL): Deny (bloquear acesso externo)
Porta 3000 (Next.js): Deny (acesso apenas via nginx)
```

### 7. Cron Jobs (Backup Automático)

**Caminho:** Cron

```bash
# Backup diário às 3h da manhã
0 3 * * * /www/wwwroot/inpacta.org.br/scripts/backup.sh

# Publicar notícias agendadas (a cada hora)
0 * * * * cd /www/wwwroot/inpacta.org.br && node scripts/publish-scheduled.js

# Limpar cache antigo (todo domingo às 2h)
0 2 * * 0 cd /www/wwwroot/inpacta.org.br && rm -rf .next/cache/*
```

### 8. Monitoramento

**Caminho:** Monitoring

- **CPU Alarm**: > 80% por 5 minutos
- **Memory Alarm**: > 85% por 5 minutos
- **Disk Alarm**: > 90%
- **SSL Expiry**: Alertar 30 dias antes

### 9. Logs

**Localizações importantes:**

```bash
# Logs do Next.js (via PM2)
/root/.pm2/logs/inpacta-out.log
/root/.pm2/logs/inpacta-error.log

# Logs do Nginx
/www/wwwlogs/inpacta.org.br.log
/www/wwwlogs/inpacta.org.br.error.log

# Logs do PostgreSQL
/www/server/postgresql/logs/postgresql-*.log

# Logs de backup
/www/backup/inpacta/backup.log
```

### 10. Otimizações de Performance

#### A. Compressão Gzip (Nginx)
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1000;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
           application/json application/javascript application/xml+rss 
           application/rss+xml font/truetype font/opentype 
           application/vnd.ms-fontobject image/svg+xml;
```

#### B. Cache do Next.js
Já configurado automaticamente pelo Next.js em `.next/`

#### C. PM2 (se não usar Node Project do aaPanel)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "inpacta" -- start

# Configurar auto-start
pm2 startup
pm2 save

# Ver logs
pm2 logs inpacta

# Monitoramento
pm2 monit
```

**Arquivo de configuração PM2** (`scripts/pm2.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'inpacta',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/www/wwwroot/inpacta.org.br',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/www/wwwlogs/pm2-inpacta-error.log',
    out_file: '/www/wwwlogs/pm2-inpacta-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
```

---

## 📊 Recursos Recomendados do Servidor

### Mínimo (Tráfego Baixo)
```
CPU: 1 vCPU
RAM: 1 GB
Disco: 20 GB SSD
Largura de Banda: 1 TB/mês
```

### Recomendado (Tráfego Médio)
```
CPU: 2 vCPU
RAM: 2 GB
Disco: 40 GB SSD
Largura de Banda: 2 TB/mês
```

### Ideal (Tráfego Alto)
```
CPU: 4 vCPU
RAM: 4 GB
Disco: 80 GB SSD
Largura de Banda: 5 TB/mês
```

---

## 🔄 Processo de Deploy

### Deploy Manual (via SSH)
```bash
# Conectar ao servidor
ssh usuario@seu-servidor

# Ir para pasta do projeto
cd /www/wwwroot/inpacta.org.br

# Atualizar código (se usar git)
git pull origin main

# Instalar dependências
npm ci

# Executar migrações
npm run db:migrate

# Build
npm run build

# Reiniciar
pm2 restart inpacta
# OU via aaPanel: Website → Node Project → Restart
```

### Deploy Automatizado (GitHub Actions - Futuro)
Ver exemplo em `.github/workflows/deploy.yml`

---

## 🛡️ Checklist de Segurança

- [ ] Firewall configurado (apenas portas necessárias)
- [ ] SSL/HTTPS habilitado e renovação automática
- [ ] PostgreSQL apenas acesso local (127.0.0.1)
- [ ] Senhas fortes para banco de dados
- [ ] `.env` fora do git (`.gitignore`)
- [ ] aaPanel acessível apenas por IP autorizado
- [ ] Backup automático diário
- [ ] Monitoramento de recursos ativo
- [ ] Rate limiting no Nginx (se necessário)
- [ ] Headers de segurança configurados
- [ ] Logs sendo coletados e rotacionados

---

## 📞 Suporte

**Documentação aaPanel:** https://doc.aapanel.com/
**Documentação Next.js:** https://nextjs.org/docs
**Documentação PostgreSQL:** https://www.postgresql.org/docs/

---

**Última atualização:** 18/12/2024
