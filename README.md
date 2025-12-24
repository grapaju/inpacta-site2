## InPACTA — Site institucional (Next.js + Tailwind)

Site institucional do InPACTA (Instituto de Projetos Avançados para Cidades, Tecnologia e Administração), dedicado ao fortalecimento da governança pública através de inovação, tecnologia e inteligência de dados. Com foco em acessibilidade (WCAG 2.1 AA), LGPD, transparência e visual moderno com glassmorphism e tema claro/escuro.

### Como rodar

```powershell
npm install
npm run dev
```

Abra http://localhost:3000

### Estrutura principal


 - `src/app/page.js`: Home (hero, serviços com ícones, destaques, KPIs, CTA)

- Glassmorphism: usar `.glass`/`.glass-dark` em cartões, com gradiente sutil e blur; bordas arredondadas 12–16px
- Cores: base clara `--background: #f7fafc`, base escura `--background: #0b1016`; destaque `--primary: #0A2540`, acentos `--accent: #3a6fa6`, `--orange: #FF6B35`, `--green: #27AE60`
- Tipografia: fontes Geist (sans/mono) via `next/font`; tamanho base ajustável em `%` (controle A-/A/A+)
- Animações: transições de 150–250ms, respeitando `prefers-reduced-motion`

### Acessibilidade e LGPD

- Skip link, foco visível (`.ring-focus`), navegação por teclado e contraste adequado
- Formulários com rótulos e `aria-*` contextuais
- Cookie banner sem coleta prévia; registra preferências em `localStorage`
- Páginas dedicadas: `lgpd` e `acessibilidade`

### Deploy e Infraestrutura

#### 🚀 Início Rápido
Para configurar o banco de dados no aaPanel e fazer deploy:
```bash
# Guia rápido (30 min)
cat QUICKSTART-AAPANEL.md

# Build e deploy
npm run deploy:aapanel
```

#### 📚 Documentação Completa

**Configuração do Servidor:**
- **[QUICKSTART-AAPANEL.md](./QUICKSTART-AAPANEL.md)** - Guia rápido de 30 minutos
- **[AAPANEL-DATABASE-SETUP.md](./AAPANEL-DATABASE-SETUP.md)** - Instalação detalhada do PostgreSQL
- **[AAPANEL-CONFIG.md](./AAPANEL-CONFIG.md)** - Configurações do aaPanel, Nginx e otimizações
- **[DEPLOY.md](./DEPLOY.md)** - Processo de deploy e CI/CD

**Banco de Dados:**
- **PostgreSQL** local no aaPanel (recomendado para produção)
- Scripts de migração do Neon: `scripts/migrate-from-neon.js`
- Backup automático: `scripts/backup.sh`
- Restauração: `scripts/restore.sh`

**Painel Administrativo:**
- **[ADMIN-IMPROVEMENTS.md](./ADMIN-IMPROVEMENTS.md)** - Roadmap de melhorias
- Sistema de autenticação com NextAuth
- Editor TipTap para conteúdo rico
- Gerenciamento de notícias, serviços e projetos

#### 📦 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento

# Banco de Dados
npm run db:migrate       # Executar migrações
npm run db:seed          # Criar usuário admin

# Deploy
npm run deploy:aapanel   # Migrações + Build
npm run deploy:fast      # Apenas build
npm run deploy:ci        # Instalação limpa + deploy

# Build
npm run build            # Build de produção
npm run start            # Iniciar em produção
```

#### 🔐 Acesso Administrativo

Após configurar o banco e executar `npm run db:seed`:
- URL: `https://inpacta.org.br/admin/login`
- Credenciais: Consulte `scripts/setup-production.js`

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [aaPanel Documentation](https://doc.aapanel.com/) - Server management
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Database documentation
- [Prisma Docs](https://www.prisma.io/docs) - ORM and migrations
