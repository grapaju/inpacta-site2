# 📚 Índice da Documentação - INPACTA

Bem-vindo à documentação completa do projeto INPACTA. Este índice organiza todos os guias e documentos por categoria.

---

## 🚀 INÍCIO RÁPIDO

### Para Desenvolvedores
- **[README.md](./README.md)** - Visão geral do projeto, como rodar localmente
- **[QUICKSTART-AAPANEL.md](./QUICKSTART-AAPANEL.md)** ⭐ - Guia rápido de 30 min para setup no aaPanel

### Para Administradores do Site
- Acesso: https://inpacta.org.br/admin/login
- Credenciais: Ver documentação de deploy ou perguntar ao dev

---

## 🗄️ BANCO DE DADOS & INFRAESTRUTURA

### Configuração do aaPanel
1. **[AAPANEL-DATABASE-SETUP.md](./AAPANEL-DATABASE-SETUP.md)** ⭐ - Guia completo de instalação do PostgreSQL
   - Instalação do PostgreSQL
   - Criação do banco de dados
   - Configuração de variáveis de ambiente
   - Migração de dados do Neon
   - Alternativa: MySQL
   - Solução de problemas

2. **[AAPANEL-CONFIG.md](./AAPANEL-CONFIG.md)** - Configurações detalhadas do aaPanel
   - Projeto Node.js
   - Variáveis de ambiente
   - Nginx (reverse proxy, cache, SSL)
   - PostgreSQL (performance tuning)
   - Firewall
   - Cron jobs
   - PM2
   - Monitoramento

3. **[CHECKLIST-SETUP.md](./CHECKLIST-SETUP.md)** ⭐ - Checklist passo a passo completo
   - 10 partes detalhadas
   - Verificações de teste
   - Anotações de credenciais
   - Comandos úteis

---

## 📐 ARQUITETURA & DESIGN

4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Visão técnica do sistema
   - Stack tecnológico
   - Estrutura de pastas
   - Fluxos de dados
   - Autenticação JWT
   - Boas práticas

5. **[ADMIN-IMPROVEMENTS.md](./ADMIN-IMPROVEMENTS.md)** - Melhorias futuras do admin
   - UI/UX enhancements
   - Performance
   - Segurança
   - Features

6. **[LICITACOES-MELHORIAS.md](./LICITACOES-MELHORIAS.md)** 📋 - Especificação das melhorias de licitações
   - Distinção entre Licitações e Transparência
   - Organização por fases
   - Movimentações e timeline
   - Upload de documentos

7. **[LICITACOES-IMPLEMENTADO.md](./LICITACOES-IMPLEMENTADO.md)** ✅ - Implementação completa do sistema
   - Banco de dados (3 enums, 1 tabela, 7 campos)
   - 7 APIs backend
   - 8 componentes React
   - 3 páginas admin
   - Validações e regras
   - Guia de uso completo
   - Diagrama de arquitetura
   - Fluxo de deploy
   - Estrutura de dados
   - Autenticação
   - Stack tecnológico
   - Performance
   - Segurança
   - Monitoramento
   - Backup & Recovery
   - Roadmap

---

## 🚢 DEPLOY & PRODUÇÃO

5. **[DEPLOY.md](./DEPLOY.md)** - Deploy na VPS com aaPanel
   - Variáveis de ambiente
   - Build e migrações via SSH
   - Execução pelo aaPanel
   - Nginx
   - Usando Neon (PostgreSQL gerenciado)

6. **[DEPLOY-DEBUG.md](./DEPLOY-DEBUG.md)** - Debug e troubleshooting de deploy
   - Snippets Nginx
   - Problemas comuns
   - Logs

---

## 🛠️ SCRIPTS UTILITÁRIOS

### Backup e Restauração
7. **[scripts/backup.sh](./scripts/backup.sh)** - Script de backup automático
   - Backup do PostgreSQL
   - Backup de uploads
   - Backup de configs
   - Limpeza de backups antigos
   - Verificação de integridade

8. **[scripts/restore.sh](./scripts/restore.sh)** - Script de restauração
   - Restaurar banco de dados
   - Backup de segurança antes de restaurar
   - Reiniciar aplicação

### Migração
9. **[scripts/migrate-from-neon.js](./scripts/migrate-from-neon.js)** - Migração do Neon para aaPanel
   - Copiar usuários
   - Copiar notícias
   - Copiar serviços
   - Copiar projetos
   - Verificar integridade

### Setup
10. **[scripts/setup-production.js](./scripts/setup-production.js)** - Setup inicial
    - Criar usuário admin
    - Dados de exemplo (se necessário)

11. **[scripts/deploy.js](./scripts/deploy.js)** - Script de deploy

12. **[scripts/pm2.config.js](./scripts/pm2.config.js)** - Configuração do PM2

---

## 🎨 PAINEL ADMINISTRATIVO

13. **[ADMIN-IMPROVEMENTS.md](./ADMIN-IMPROVEMENTS.md)** ⭐ - Roadmap de melhorias
    - **Segurança**
      - Autenticação em duas etapas (2FA)
      - Log de auditoria
      - Limitação de tentativas de login
      - Sessões seguras
    
    - **Interface**
      - Dashboard aprimorado
      - Editor de conteúdo melhorado
      - Preview em tempo real
      - Modo escuro completo
    
    - **Funcionalidades**
      - Sistema de categorias e tags
      - Agendamento de publicações
      - Gerenciamento de mídias
      - Rascunhos e revisão
      - Comentários internos
    
    - **Analytics**
      - Integração Google Analytics
      - Relatórios customizados
      - Exportação de dados
    
    - **Notificações**
      - Sistema interno
      - Emails automáticos
    
    - **Performance**
      - Cache de consultas
      - Paginação eficiente
      - Otimização de imagens
    
    - **Backup**
      - Automático
      - Interface de restauração
    
    - **Mobile**
      - Responsividade
      - PWA
    
    - **Ferramentas**
      - Importação em massa
      - Testes A/B
      - Webhooks

---

## 📊 BANCO DE DADOS

### Schema Prisma
14. **[prisma/schema.prisma](./prisma/schema.prisma)** - Definição do schema
    - User (usuários/admins)
    - News (notícias)
    - Service (serviços)
    - Project (projetos)
    - Relacionamentos

### Migrações
15. **[prisma/migrations/](./prisma/migrations/)** - Histórico de migrações
    - 20251019191543_init_postgresql

---

## ⚙️ CONFIGURAÇÕES

### Next.js
16. **[next.config.mjs](./next.config.mjs)** - Configuração do Next.js
17. **[middleware.js](./middleware.js)** - Middleware (proteção de rotas admin)

### Build
18. **[package.json](./package.json)** - Dependências e scripts
    - `npm run dev` - Desenvolvimento
    - `npm run build` - Build de produção
    - `npm run start` - Iniciar em produção
    - `npm run db:migrate` - Executar migrações
    - `npm run db:seed` - Criar admin
    - `npm run deploy:aapanel` - Deploy completo
    - `npm run deploy:fast` - Build rápido
    - `npm run deploy:ci` - Deploy limpo

### Linting
19. **[eslint.config.mjs](./eslint.config.mjs)** - ESLint
20. **[jsconfig.json](./jsconfig.json)** - JavaScript config

### Styles
21. **[postcss.config.mjs](./postcss.config.mjs)** - PostCSS
22. **[src/app/globals.css](./src/app/globals.css)** - CSS global

---

## 📁 ESTRUTURA DO PROJETO

```
inpacta-site/
├─ 📚 DOCUMENTAÇÃO
│  ├─ README.md                      # Início
│  ├─ INDEX-DOCS.md                  # Este arquivo
│  ├─ QUICKSTART-AAPANEL.md          # Guia rápido ⭐
│  ├─ CHECKLIST-SETUP.md             # Checklist completo ⭐
│  ├─ AAPANEL-DATABASE-SETUP.md      # Setup PostgreSQL ⭐
│  ├─ AAPANEL-CONFIG.md              # Configs aaPanel
│  ├─ ARCHITECTURE.md                # Arquitetura
│  ├─ ADMIN-IMPROVEMENTS.md          # Melhorias admin ⭐
│  ├─ DEPLOY.md                      # Deploy
│  └─ DEPLOY-DEBUG.md                # Debug
│
├─ 🗄️ BANCO DE DADOS
│  └─ prisma/
│     ├─ schema.prisma               # Schema do banco
│     └─ migrations/                 # Histórico de migrações
│
├─ 🛠️ SCRIPTS
│  └─ scripts/
│     ├─ backup.sh                   # Backup automático
│     ├─ restore.sh                  # Restaurar backup
│     ├─ migrate-from-neon.js        # Migração Neon→aaPanel
│     ├─ setup-production.js         # Setup inicial
│     ├─ deploy.js                   # Deploy
│     └─ pm2.config.js               # Config PM2
│
├─ ⚙️ CONFIGURAÇÕES
│  ├─ next.config.mjs                # Next.js
│  ├─ middleware.js                  # Middleware
│  ├─ package.json                   # Dependências
│  ├─ eslint.config.mjs              # ESLint
│  └─ jsconfig.json                  # JavaScript
│
└─ 💻 CÓDIGO FONTE
   └─ src/
      ├─ app/                        # Páginas e API Routes
      │  ├─ page.js                  # Home pública
      │  ├─ admin/                   # Painel admin
      │  │  ├─ page.js               # Dashboard
      │  │  ├─ login/                # Login
      │  │  ├─ news/                 # CRUD Notícias
      │  │  ├─ services/             # CRUD Serviços
      │  │  └─ seo/                  # SEO Config
      │  └─ api/                     # API Routes
      │     ├─ auth/                 # NextAuth
      │     ├─ admin/                # Admin APIs
      │     └─ public/               # APIs públicas
      │
      ├─ components/                 # Componentes React
      │  ├─ admin/                   # Admin components
      │  ├─ RichTextEditor.jsx       # TipTap
      │  └─ ...
      │
      └─ lib/                        # Bibliotecas
         └─ prisma.js                # Cliente Prisma
```

---

## 🎯 GUIAS POR CENÁRIO

### Cenário 1: Primeira Instalação
1. [QUICKSTART-AAPANEL.md](./QUICKSTART-AAPANEL.md) - Leia primeiro
2. [CHECKLIST-SETUP.md](./CHECKLIST-SETUP.md) - Siga passo a passo
3. [AAPANEL-DATABASE-SETUP.md](./AAPANEL-DATABASE-SETUP.md) - Detalhes do banco

### Cenário 2: Migrar do Neon
1. [AAPANEL-DATABASE-SETUP.md](./AAPANEL-DATABASE-SETUP.md) - Seção "Migração de Dados"
2. Use `scripts/migrate-from-neon.js`
3. [CHECKLIST-SETUP.md](./CHECKLIST-SETUP.md) - Parte 10

### Cenário 3: Fazer Deploy de Atualização
1. [DEPLOY.md](./DEPLOY.md) - Processo de deploy
2. SSH → `git pull` → `npm run deploy:aapanel`
3. [DEPLOY-DEBUG.md](./DEPLOY-DEBUG.md) - Se algo der errado

### Cenário 4: Restaurar Backup
1. Verificar backups disponíveis: `ls /www/backup/inpacta/`
2. Executar: `./scripts/restore.sh db_YYYYMMDD.sql.gz`
3. Ver [scripts/restore.sh](./scripts/restore.sh)

### Cenário 5: Melhorar Admin
1. [ADMIN-IMPROVEMENTS.md](./ADMIN-IMPROVEMENTS.md) - Ver roadmap
2. Escolher funcionalidade
3. Implementar

### Cenário 6: Troubleshooting
1. [DEPLOY-DEBUG.md](./DEPLOY-DEBUG.md) - Problemas comuns
2. [AAPANEL-DATABASE-SETUP.md](./AAPANEL-DATABASE-SETUP.md) - Seção "Solução de Problemas"
3. Verificar logs: `pm2 logs inpacta`

---

## 📞 CONTATOS E SUPORTE

### Documentação Externa
- **Next.js:** https://nextjs.org/docs
- **aaPanel:** https://doc.aapanel.com/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Prisma:** https://www.prisma.io/docs
- **TipTap:** https://tiptap.dev/docs

### Links Úteis
- **Site:** https://inpacta.org.br
- **Admin:** https://inpacta.org.br/admin
- **GitHub:** (adicionar link do repositório)

---

## 🔄 ATUALIZAÇÕES DA DOCUMENTAÇÃO

**Última atualização:** 18/12/2024

**Histórico:**
- 18/12/2024 - Documentação completa criada
  - Guias de setup do aaPanel
  - Scripts de backup/restore
  - Roadmap de melhorias admin
  - Arquitetura do sistema
  - Checklists e quickstart

**Próximas atualizações:**
- [ ] Screenshots do aaPanel
- [ ] Vídeo tutorial
- [ ] FAQ expandido
- [ ] Guia de contribuição

---

## ⭐ ARQUIVOS MAIS IMPORTANTES

Para começar rapidamente, foque nestes:

1. **[QUICKSTART-AAPANEL.md](./QUICKSTART-AAPANEL.md)** - 30 min para instalar tudo
2. **[CHECKLIST-SETUP.md](./CHECKLIST-SETUP.md)** - Não pule nenhum passo
3. **[ADMIN-IMPROVEMENTS.md](./ADMIN-IMPROVEMENTS.md)** - Funcionalidades futuras
4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Entender o sistema

---

## 📝 CONVENÇÕES

### Nomenclatura de Arquivos
- `UPPERCASE.md` - Documentação
- `lowercase.js` - Código fonte
- `kebab-case.sh` - Scripts shell

### Emojis nos Documentos
- 🚀 Início rápido
- ⚙️ Configuração
- 🗄️ Banco de dados
- 🔐 Segurança
- 📦 Backup
- 🎨 Interface/Design
- 📊 Analytics/Métricas
- ⚡ Performance
- 🛠️ Scripts/Ferramentas
- ⭐ Importante/Recomendado
- ✅ Checklist/Verificação
- ❌ Erro/Problema
- ⚠️ Atenção/Aviso
- 💡 Dica

---

**Navegue pela documentação conforme sua necessidade. Boa sorte! 🎉**
