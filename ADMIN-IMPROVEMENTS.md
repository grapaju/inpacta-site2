# Guia de Melhorias no Painel Administrativo

## 📋 Visão Geral

Este guia apresenta sugestões de melhorias para o painel administrativo do site INPACTA, incluindo segurança, usabilidade e novas funcionalidades.

---

## 🔐 1. Melhorias de Segurança

### 1.1 Autenticação em Duas Etapas (2FA)

**Implementação:**
```bash
npm install speakeasy qrcode
```

Adicionar ao modelo User:
```prisma
model User {
  // ... campos existentes
  twoFactorSecret String?
  twoFactorEnabled Boolean @default(false)
}
```

### 1.2 Log de Auditoria Completo

Criar modelo de auditoria:
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entity    String   // news, service, user, etc
  entityId  String?
  changes   Json?    // Dados antes/depois
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@map("audit_logs")
  @@index([userId])
  @@index([createdAt])
}
```

### 1.3 Limitação de Tentativas de Login

```javascript
// lib/rate-limit.js
const loginAttempts = new Map()

export function checkRateLimit(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0, resetAt: Date.now() + 900000 }
  
  if (Date.now() > attempts.resetAt) {
    attempts.count = 0
    attempts.resetAt = Date.now() + 900000 // 15 minutos
  }
  
  if (attempts.count >= 5) {
    return { 
      allowed: false, 
      resetAt: attempts.resetAt 
    }
  }
  
  attempts.count++
  loginAttempts.set(ip, attempts)
  
  return { allowed: true }
}
```

### 1.4 Sessões Seguras

- ✅ Já usa NextAuth
- ✅ JWT com secret forte
- 🔧 Adicionar expiração de sessão configurável
- 🔧 Logout automático por inatividade

---

## 🎨 2. Melhorias de Interface

### 2.1 Dashboard Aprimorado

**Gráficos e Métricas:**
```bash
npm install recharts
```

Adicionar ao dashboard:
- 📊 Gráfico de publicações por mês
- 📈 Visitantes por página (integrar Google Analytics)
- 🔥 Notícias mais acessadas
- 📅 Calendário de publicações programadas

### 2.2 Editor de Conteúdo Melhorado

Você já usa TipTap. Adicionar:
- 📸 Galeria de imagens
- 🎬 Embed de vídeos (YouTube, Vimeo)
- 📊 Tabelas responsivas
- 🎨 Blocos customizados (callouts, alertas)
- 💾 Salvamento automático (autosave)
- 📝 Histórico de versões

```javascript
// Adicionar extensões ao TipTap
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Youtube } from '@tiptap/extension-youtube'

extensions: [
  // ... extensões existentes
  Table,
  TableRow,
  TableCell,
  TableHeader,
  Youtube,
]
```

### 2.3 Preview em Tempo Real

Adicionar botão "Visualizar" que abre modal mostrando como ficará publicado.

### 2.4 Modo Escuro Completo no Admin

Verificar se todas as páginas admin suportam tema escuro.

---

## 📦 3. Novas Funcionalidades

### 3.1 Sistema de Categorias e Tags

```prisma
model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  description String?
  color     String   @default("#3B82F6")
  icon      String?
  createdAt DateTime @default(now())
  
  news      News[]
  
  @@map("categories")
}

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
  
  news      NewsTag[]
  
  @@map("tags")
}

model NewsTag {
  newsId    String
  tagId     String
  news      News @relation(fields: [newsId], references: [id], onDelete: Cascade)
  tag       Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([newsId, tagId])
  @@map("news_tags")
}
```

Atualizar News:
```prisma
model News {
  // ... campos existentes
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
  tags       NewsTag[]
}
```

### 3.2 Agendamento de Publicações

```prisma
model News {
  // ... campos existentes
  scheduledFor DateTime? // Data/hora para publicar automaticamente
}
```

Criar cron job:
```javascript
// scripts/publish-scheduled.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function publishScheduled() {
  const now = new Date()
  
  const toPublish = await prisma.news.findMany({
    where: {
      published: false,
      scheduledFor: {
        lte: now
      }
    }
  })
  
  for (const news of toPublish) {
    await prisma.news.update({
      where: { id: news.id },
      data: {
        published: true,
        publishedAt: now
      }
    })
    console.log(`✅ Publicado: ${news.title}`)
  }
}

publishScheduled()
  .then(() => process.exit(0))
  .catch(console.error)
```

Adicionar ao crontab:
```bash
# Executar a cada hora
0 * * * * cd /www/wwwroot/inpacta.org.br && node scripts/publish-scheduled.js
```

### 3.3 Gerenciamento de Mídias

Criar página dedicada para uploads:
- 📁 Organização por pastas
- 🔍 Busca de imagens
- ✂️ Crop e redimensionamento
- 🗑️ Exclusão de arquivos não utilizados
- 📊 Estatísticas de uso de espaço

```prisma
model Media {
  id          String   @id @default(cuid())
  filename    String
  originalName String
  path        String
  url         String
  mimeType    String
  size        Int
  width       Int?
  height      Int?
  uploadedBy  String
  uploader    User     @relation(fields: [uploadedBy], references: [id])
  createdAt   DateTime @default(now())
  
  @@map("media")
  @@index([uploadedBy])
}
```

### 3.4 Sistema de Rascunhos e Revisão

```prisma
model News {
  // ... campos existentes
  status String @default("draft") // draft, review, published, archived
  reviewedBy String?
  reviewer   User? @relation(fields: [reviewedBy], references: [id])
  reviewedAt DateTime?
}
```

Workflow:
1. Editor cria (status: `draft`)
2. Solicita revisão (status: `review`)
3. Admin aprova (status: `published`)
4. Ou solicita alterações (volta para `draft`)

### 3.5 Comentários Internos

```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String
  newsId    String?
  serviceId String?
  projectId String?
  news      News?    @relation(fields: [newsId], references: [id], onDelete: Cascade)
  service   Service? @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  
  @@map("comments")
}
```

---

## 📊 4. Analytics e Relatórios

### 4.1 Integração com Google Analytics

```javascript
// lib/analytics.js
export async function getPageViews(path) {
  // Usar Google Analytics Data API
  const response = await fetch('https://analyticsdata.googleapis.com/v1beta/properties/...')
  return response.json()
}
```

### 4.2 Relatórios Personalizados

Página de relatórios com:
- 📈 Total de visualizações por período
- 👥 Usuários mais ativos
- 📰 Notícias mais populares
- 🔍 Termos mais buscados
- 📱 Dispositivos dos visitantes
- 🌍 Origem geográfica

### 4.3 Exportação de Dados

```javascript
// api/admin/export/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // csv, json, pdf
  
  const news = await prisma.news.findMany()
  
  if (type === 'csv') {
    const csv = convertToCSV(news)
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=noticias.csv'
      }
    })
  }
  
  // ... outros formatos
}
```

---

## 🔔 5. Notificações

### 5.1 Sistema de Notificações Internas

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  message   String
  type      String   // info, success, warning, error
  read      Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())
  
  @@map("notifications")
  @@index([userId, read])
}
```

Notificar quando:
- ✉️ Nova notícia aguardando revisão
- ✅ Conteúdo aprovado
- 💬 Novo comentário interno
- ⚠️ Erro no sistema
- 📊 Relatório semanal pronto

### 5.2 Emails Automáticos

```javascript
// lib/email.js
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  // ... configuração
})

export async function sendNotification(to, subject, html) {
  await transporter.sendMail({
    from: 'noreply@inpacta.org.br',
    to,
    subject,
    html
  })
}
```

---

## 🚀 6. Performance

### 6.1 Cache de Consultas

```javascript
// lib/cache.js
const cache = new Map()

export function cached(key, fn, ttl = 300000) { // 5 minutos
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }
  
  const value = fn()
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl
  })
  
  return value
}
```

### 6.2 Paginação Eficiente

```javascript
// api/admin/news/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  const news = await prisma.news.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  })
  
  const total = await prisma.news.count()
  
  return Response.json({
    data: news,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
}
```

### 6.3 Otimização de Imagens

```bash
npm install sharp
```

```javascript
// api/admin/upload/route.js
import sharp from 'sharp'

export async function POST(request) {
  const formData = await request.formData()
  const file = formData.get('file')
  
  // Redimensionar e otimizar
  await sharp(file.buffer)
    .resize(1200, 800, { fit: 'inside' })
    .jpeg({ quality: 85 })
    .toFile(`public/uploads/${filename}`)
  
  // Criar thumbnail
  await sharp(file.buffer)
    .resize(300, 200, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(`public/uploads/thumbs/${filename}`)
}
```

---

## 🛡️ 7. Backup e Recuperação

### 7.1 Backup Automático

```bash
# scripts/backup.sh
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/inpacta"

# Backup do banco
pg_dump -h localhost -U inpacta_user inpacta_db > "$BACKUP_DIR/db_$DATE.sql"

# Backup de uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" public/uploads/

# Limpar backups antigos (manter últimos 30 dias)
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup concluído: $DATE"
```

Agendar no crontab:
```bash
# Todo dia às 3h da manhã
0 3 * * * /www/wwwroot/inpacta.org.br/scripts/backup.sh
```

### 7.2 Ponto de Restauração

Interface no admin para:
- Ver backups disponíveis
- Restaurar banco de dados
- Restaurar arquivos
- Preview antes de restaurar

---

## 📱 8. Responsividade Mobile

### 8.1 Admin Mobile-First

Verificar e melhorar:
- ✅ Tabelas responsivas (scroll horizontal em mobile)
- ✅ Menu hamburguer
- ✅ Touch-friendly (botões maiores)
- ✅ Editor mobile otimizado

### 8.2 App Mobile (PWA)

Transformar o admin em PWA:
```javascript
// next.config.mjs
import withPWA from 'next-pwa'

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})
```

---

## 🔧 9. Ferramentas Úteis

### 9.1 Importação em Massa

Interface para:
- 📥 Importar notícias de CSV/JSON
- 📥 Importar de WordPress (XML)
- 📥 Migração de outro CMS

### 9.2 Testes A/B

```prisma
model ABTest {
  id        String   @id @default(cuid())
  name      String
  variantA  String   // URL ou configuração
  variantB  String
  active    Boolean  @default(true)
  startDate DateTime @default(now())
  endDate   DateTime?
  
  @@map("ab_tests")
}
```

### 9.3 Webhooks

```prisma
model Webhook {
  id        String   @id @default(cuid())
  url       String
  event     String   // news.created, news.updated, etc
  active    Boolean  @default(true)
  secret    String
  createdAt DateTime @default(now())
  
  @@map("webhooks")
}
```

Disparar ao publicar notícia, atualizar serviço, etc.

---

## 📋 Checklist de Implementação

### Fase 1 - Essencial (1-2 semanas)
- [ ] Configurar PostgreSQL no aaPanel
- [ ] Migrar dados do Neon
- [ ] Log de auditoria básico
- [ ] Rate limiting no login
- [ ] Backup automático diário
- [ ] Melhorias no editor (autosave)

### Fase 2 - Segurança (1 semana)
- [ ] 2FA opcional
- [ ] Sessões com timeout
- [ ] Políticas de senha forte
- [ ] Monitoramento de atividades suspeitas

### Fase 3 - Funcionalidades (2-3 semanas)
- [ ] Sistema de categorias
- [ ] Agendamento de posts
- [ ] Gerenciador de mídias
- [ ] Sistema de rascunhos/revisão
- [ ] Comentários internos

### Fase 4 - Analytics (1 semana)
- [ ] Integração Google Analytics
- [ ] Dashboard com métricas
- [ ] Relatórios customizados
- [ ] Exportação de dados

### Fase 5 - Otimização (1 semana)
- [ ] Cache de consultas
- [ ] Otimização de imagens
- [ ] Paginação eficiente
- [ ] PWA admin

---

## 🎯 Próximos Passos Imediatos

1. **Configurar Banco no aaPanel**
   - Seguir [AAPANEL-DATABASE-SETUP.md](./AAPANEL-DATABASE-SETUP.md)

2. **Implementar Log de Auditoria**
   - Criar migration
   - Adicionar em todas operações CRUD

3. **Melhorar Editor**
   - Adicionar autosave
   - Preview em tempo real
   - Histórico de versões

4. **Configurar Backups**
   - Script automático
   - Testar restauração

---

**Precisa de ajuda com alguma implementação específica? Estou aqui! 🚀**
