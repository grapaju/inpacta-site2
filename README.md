## InPacta — Site institucional (Next.js + Tailwind)

Site institucional do InPacta (Instituto de Projetos Avançados para Cidades, Tecnologia e Administração), dedicado ao fortalecimento da governança pública através de inovação, tecnologia e inteligência de dados. Com foco em acessibilidade (WCAG 2.1 AA), LGPD, transparência e visual moderno com glassmorphism e tema claro/escuro.

### Como rodar

```powershell
npm install
npm run dev
```

Abra http://localhost:3000

### Estrutura principal


 - `src/app/page.js`: Home (hero, serviços com ícones, destaques, KPIs, CTA)

- Glassmorphism: usar `.glass`/`.glass-dark` em cartões, com gradiente sutil e blur; bordas arredondadas 12–16px
- Cores: base clara `--background: #f7fafc`, base escura `--background: #0b1016`; destaque `--primary: #0A2540`, acentos `--accent: #00A3E0`, `--orange: #FF6B35`, `--green: #27AE60`
- Tipografia: fontes Geist (sans/mono) via `next/font`; tamanho base ajustável em `%` (controle A-/A/A+)
- Animações: transições de 150–250ms, respeitando `prefers-reduced-motion`

### Acessibilidade e LGPD

- Skip link, foco visível (`.ring-focus`), navegação por teclado e contraste adequado
- Formulários com rótulos e `aria-*` contextuais
- Cookie banner sem coleta prévia; registra preferências em `localStorage`
- Páginas dedicadas: `lgpd` e `acessibilidade`

### Deploy

- Build: `npm run build`
- Exporta `robots.txt` e `sitemap.xml` automaticamente com base em `metadataBase`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
