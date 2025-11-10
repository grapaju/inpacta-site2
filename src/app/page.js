import Link from "next/link";
import { news as staticNews } from "@/data/news";
import { services } from "@/data/services";
import { IconCity, IconCpu, IconLightbulb, IconShield } from "@/components/Icons";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

// Função para buscar notícias mais recentes
async function getLatestNews() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://inpacta-site.vercel.app'}/api/public/news?limit=3`, {
      next: { revalidate: 300 } // Revalida a cada 5 minutos
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.news && data.news.length > 0) {
        return data.news;
      }
    }
  } catch (error) {
    console.error('Erro ao buscar notícias da API:', error);
  }
  
  // Fallback para dados estáticos
  return staticNews.slice(0, 3);
}

export default async function Home() {
  const news = await getLatestNews();
  return (
    <div>
      {/* Hero */}
      <section className="hero-bg text-white relative overflow-hidden min-h-[70vh] flex items-center">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        
        {/* Elementos decorativos sutis */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/3 to-transparent rounded-full blur-3xl transform translate-x-48 -translate-y-48"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 relative">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Badge institucional */}
            <div className="hero-badge inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm font-medium mb-8 shadow-lg">
              <span className="size-2 bg-[var(--green)] rounded-full animate-pulse"></span>
              <span>Governança e inovação que transformam o setor público</span>
            </div>
            
            {/* Título principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              <span className="block text-white mb-2">Fortalecemos a</span>
              <span className="bg-gradient-to-r from-[var(--green)] via-[var(--accent)] to-[var(--green)] bg-clip-text text-transparent">
                governança pública
              </span>
            </h1>
            
            {/* Descrição */}
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-10">
              Desenvolvemos políticas, metodologias e soluções baseadas em <strong className="text-white">inovação</strong>, 
              <strong className="text-white"> tecnologia</strong> e <strong className="text-white">inteligência de dados</strong> 
              que aumentam a eficiência do Estado e geram resultados concretos para cidadãos.
            </p>
            
            {/* CTAs principais */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/servicos"
                className="hero-cta-primary inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-white to-white/95 text-[var(--primary)] font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ring-focus group"
              >
                Nossos serviços
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/sobre"
                className="hero-cta-secondary inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/60 text-white font-bold text-lg hover:bg-white/10 hover:border-white/80 backdrop-blur transition-all duration-300 ring-focus group"
              >
                Sobre o InPacta
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
            
            {/* Indicadores principais simplificados */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="size-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[var(--green)]/20 to-[var(--green)]/10 border border-[var(--green)]/30 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--green)]">
                    <path d="M12 2l3.5 7 7.5 1-5.5 5 1.5 7.5L12 19l-6.5 3.5L7 15l-5.5-5 7.5-1L12 2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Governança</h3>
                <p className="text-sm text-white/70">Estruturas e processos</p>
              </div>
              
              <div className="text-center">
                <div className="size-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Inteligência</h3>
                <p className="text-sm text-white/70">Dados e evidências</p>
              </div>
              
              <div className="text-center">
                <div className="size-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[var(--orange)]/20 to-[var(--orange)]/10 border border-[var(--orange)]/30 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--orange)]">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Impacto</h3>
                <p className="text-sm text-white/70">Resultados reais</p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Quem somos */}
      <section className="section max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Sobre o InPacta</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
              Apoiando gestores e sociedade na construção de administrações mais modernas, justas e conectadas às demandas sociais.
            </p>
          </div>
        </ScrollReveal>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="space-y-5 text-lg leading-relaxed text-[color:var(--muted)]">
              <p>
                O <strong className="text-[var(--foreground)]">InPacta</strong> é o Instituto de Projetos Avançados para Cidades, Tecnologia e Administração, 
                uma instituição dedicada ao fortalecimento da governança pública através da inovação e inteligência de dados.
              </p>
              <p>
                Nossa missão é fortalecer a governança pública por meio da inovação, tecnologia e inteligência de dados, 
                desenvolvendo políticas, metodologias e soluções que aumentem a eficiência do Estado, ampliem a 
                transparência e transformem serviços públicos em resultados concretos.
              </p>
              <p>
                Trabalhamos com <strong className="text-[var(--accent)]">governança aplicada</strong>, <strong className="text-[var(--orange)]">dados e inteligência</strong>, 
                <strong className="text-[var(--green)]"> gestão por resultados</strong> e foco em impacto real, transformando boas práticas em 
                resultados concretos para governos e cidadãos.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3" aria-label="Pilares do InPacta">
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 text-sm font-medium">
                <span className="size-3 rounded-full bg-[var(--accent)]" /> 
                Governança
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[var(--orange)]/20 bg-gradient-to-r from-[var(--orange)]/10 to-[var(--orange)]/5 text-sm font-medium">
                <span className="size-3 rounded-full bg-[var(--orange)]" /> 
                Inovação
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[var(--green)]/20 bg-gradient-to-r from-[var(--green)]/10 to-[var(--green)]/5 text-sm font-medium">
                <span className="size-3 rounded-full bg-[var(--green)]" /> 
                Eficiência
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 text-sm font-medium">
                <span className="size-3 rounded-full bg-[var(--primary)]" /> 
                Impacto Real
              </span>
            </div>
          </div>
          
          <div className="glass rounded-3xl p-8 bg-gradient-to-br from-[var(--card)] to-[var(--background)] border-2 border-[var(--border)]">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--primary)] mb-2">Como atuamos</h3>
              <div className="h-1 w-12 bg-gradient-to-r from-[var(--accent)] to-[var(--green)] rounded-full"></div>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-4 group">
                <div className="mt-1 size-8 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="size-2.5 rounded-full bg-[var(--accent)]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--foreground)] mb-1">Governança e Segurança Pública</h4>
                  <p className="text-sm text-[color:var(--muted)]">Planos municipais, planejamento estratégico e protocolos operacionais</p>
                </div>
              </li>
              
              <li className="flex items-start gap-4 group">
                <div className="mt-1 size-8 rounded-xl bg-gradient-to-br from-[var(--orange)]/20 to-[var(--orange)]/10 border border-[var(--orange)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="size-2.5 rounded-full bg-[var(--orange)]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--foreground)] mb-1">Observatórios e Inteligência de Dados</h4>
                  <p className="text-sm text-[color:var(--muted)]">Núcleos de inteligência, dashboards e portais de transparência</p>
                </div>
              </li>
              
              <li className="flex items-start gap-4 group">
                <div className="mt-1 size-8 rounded-xl bg-gradient-to-br from-[var(--green)]/20 to-[var(--green)]/10 border border-[var(--green)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="size-2.5 rounded-full bg-[var(--green)]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--foreground)] mb-1">Planejamento Estratégico e PMO</h4>
                  <p className="text-sm text-[color:var(--muted)]">Gestão de portfólio, governança de projetos e metodologias públicas</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <Link 
                href="/sobre" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Saiba mais
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/governanca" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Governança
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* O que fazemos */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">O que fazemos</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
              Desenvolvemos políticas, metodologias e soluções que aumentam a eficiência do Estado, 
              ampliam a transparência e transformam serviços públicos em resultados concretos para governos e cidadãos.
            </p>
          </div>
        </ScrollReveal>
        
        <StaggeredReveal 
          staggerDelay={200} 
          animation="fadeUp" 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <div 
              key={service.slug} 
              className="service-card interactive-card ripple-effect group glass rounded-2xl p-8 bg-gradient-to-br border-2 border-transparent hover:border-opacity-20 transition-all duration-300"
              style={{ 
                animationDelay: `${index * 150}ms`,
                background: `linear-gradient(135deg, ${service.color}10, ${service.color}05)`,
                '--hover-border-color': service.color
              }}
            >
              <div className="mb-6">
                <div
                  className="card-icon-depth inline-flex size-16 items-center justify-center rounded-2xl transition-all duration-300"
                  style={{ 
                    backgroundColor: `${service.color}15`, 
                    color: service.color,
                    boxShadow: `0 8px 32px ${service.color}20`
                  }}
                >
                  {service.icon === "shield" && <IconShield aria-hidden width={28} height={28} />}
                  {service.icon === "analytics" && <IconCpu aria-hidden width={28} height={28} />}
                  {service.icon === "project" && <IconLightbulb aria-hidden width={28} height={28} />}
                  {service.icon === "monitor" && <IconCpu aria-hidden width={28} height={28} />}
                  {service.icon === "city" && <IconCity aria-hidden width={28} height={28} />}
                </div>
              </div>
              
              <div className="mb-3">
                <span 
                  className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-3"
                  style={{ 
                    backgroundColor: `${service.color}15`, 
                    color: service.color 
                  }}
                >
                  {service.category}
                </span>
              </div>
              
              <h3 className="card-title-reveal text-xl font-bold mb-3 text-[var(--primary)]">
                {service.title}
              </h3>
              
              <p className="text-[color:var(--muted)] leading-relaxed mb-6 group-hover:text-[var(--foreground)] transition-colors">
                {service.description}
              </p>
              
              <Link 
                href={`/servicos/${service.slug}`}
                className="inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all ring-focus group/link"
                style={{ color: service.color }}
              >
                Saiba mais 
                <span className="transition-transform group-hover/link:translate-x-1">→</span>
              </Link>
            </div>
          ))}
        </StaggeredReveal>
      </section>

      {/* Alinhamento Internacional */}
      <section className="section max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Padrões Internacionais</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-3xl mx-auto">
              Nossa atuação está alinhada aos principais frameworks e diretrizes internacionais de governança 
              pública, garantindo qualidade, eficiência e resultados mensuráveis.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="interactive-card p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/5 to-transparent">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
                  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3">OCDE</h3>
                <p className="text-[color:var(--muted)] leading-relaxed mb-3">
                  Seguimos os princípios de governança pública da Organização para a Cooperação e Desenvolvimento 
                  Econômico, focando em transparência, prestação de contas, integridade e participação cidadã.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-medium">
                    Governança Digital
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-medium">
                    Integridade
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="interactive-card p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--green)]/5 to-transparent">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[var(--green)]/10 rounded-2xl flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--green)]">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3">BID</h3>
                <p className="text-[color:var(--muted)] leading-relaxed mb-3">
                  Alinhados às diretrizes do Banco Interamericano de Desenvolvimento para modernização do Estado, 
                  eficiência administrativa, transparência e desenvolvimento sustentável.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--green)]/10 text-[var(--green)] font-medium">
                    Eficiência
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--green)]/10 text-[var(--green)] font-medium">
                    Sustentabilidade
                  </span>
                </div>
              </div>
            </div>
          </div>
        </StaggeredReveal>
      </section>

      {/* Destaques */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-4">Acesso rápido</h2>
          <p className="text-[color:var(--muted)]">Principais áreas de atuação e compromisso com a sociedade</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list" aria-label="Destaques">
          {[
            { href: "/transparencia", label: "Transparência", desc: "Dados e informações públicas acessíveis", color: "#0A2540" },
            { href: "/lgpd", label: "LGPD", desc: "Proteção e privacidade de dados pessoais", color: "#FF6B35" },
            { href: "/dados", label: "Dados Abertos", desc: "Informações governamentais abertas ao público", color: "#00A3E0" },
            { href: "/governanca", label: "Governança", desc: "Processos e estrutura organizacional", color: "#27AE60" },
          ].map((d) => (
            <Link 
              key={d.href} 
              href={d.href} 
              role="listitem" 
              className="glass rounded-2xl p-6 ring-focus group hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-[var(--card)] to-[var(--background)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="size-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ 
                    backgroundColor: `${d.color}15`, 
                    color: d.color,
                    boxShadow: `0 8px 32px ${d.color}15`
                  }}
                >
                  <span className="text-xl font-bold">→</span>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-2 text-[var(--foreground)] group-hover:text-[color:${d.color}] transition-colors">
                {d.label}
              </h3>
              
              <p className="text-sm text-[color:var(--muted)] leading-relaxed">
                {d.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Notícias */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="section-title">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Últimas notícias</h2>
              </div>
              <p className="mt-4 text-lg text-[color:var(--muted)]">
                Acompanhe nossos projetos e iniciativas em governança pública e inovação.
              </p>
            </div>
            <Link 
              href="/noticias" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold hover:scale-105 transition-transform ring-focus group"
            >
              Ver todas
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </ScrollReveal>
        
        <StaggeredReveal 
          staggerDelay={150} 
          animation="fadeUp" 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {news
            .slice()
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .slice(0, 3)
            .map((n, index) => (
              <article 
                key={n.slug} 
                className="news-card interactive-card ripple-effect group glass rounded-2xl overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--green)]"></div>
                
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="size-2 bg-[var(--accent)] rounded-full card-icon-depth"></span>
                    <time className="text-sm font-medium text-[color:var(--muted)]">
                      {new Date(n.date).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </time>
                  </div>
                  
                  <h3 className="card-title-reveal text-xl font-bold mb-3 leading-tight">
                    {n.title}
                  </h3>
                  
                  <p className="text-[color:var(--muted)] leading-relaxed mb-6 line-clamp-3 group-hover:text-[var(--foreground)] transition-colors">
                    {n.summary}
                  </p>
                  
                  <Link 
                    href={`/noticias/${n.slug}`} 
                    className="inline-flex items-center gap-2 font-semibold text-[var(--accent)] hover:gap-3 transition-all ring-focus group/link"
                  >
                    Ler matéria completa
                    <span className="transition-transform group-hover/link:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            ))}
        </StaggeredReveal>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="relative glass rounded-3xl p-12 md:p-16 overflow-hidden bg-gradient-to-br from-[var(--accent)]/5 via-[var(--card)] to-[var(--green)]/5 border-2 border-[var(--accent)]/20">
          {/* Padrão decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--accent)] to-[var(--green)] rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[var(--orange)] to-[var(--accent)] rounded-full blur-3xl transform -translate-x-24 translate-y-24"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-4">
                Fortaleça a{" "}
                <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--green)] bg-clip-text text-transparent">
                  governança pública
                </span>
              </h2>
              <p className="text-lg text-[color:var(--muted)] leading-relaxed max-w-2xl">
                Fale com nossa equipe para desenvolver políticas, metodologias e soluções que aumentem a eficiência 
                do Estado e transformem serviços públicos em resultados concretos.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/contato" 
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-bold text-lg hover:scale-105 transition-transform ring-focus group"
                >
                  Entrar em contato
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                
                <Link 
                  href="/servicos" 
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 border-[var(--accent)] text-[var(--accent)] font-bold text-lg hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-colors ring-focus"
                >
                  Ver serviços
                </Link>
              </div>
            </div>
            
            {/* Stats rápidas */}
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="glass rounded-2xl p-6 bg-white/50 border border-[var(--accent)]/20">
                <div className="text-3xl font-bold text-[var(--accent)]">Governança</div>
                <div className="text-sm text-[color:var(--muted)] font-medium">Aplicada</div>
              </div>
              <div className="glass rounded-2xl p-6 bg-white/50 border border-[var(--green)]/20">
                <div className="text-3xl font-bold text-[var(--green)]">Evidências</div>
                <div className="text-sm text-[color:var(--muted)] font-medium">Dados e Inteligência</div>
              </div>
              <div className="glass rounded-2xl p-6 bg-white/50 border border-[var(--orange)]/20 col-span-2">
                <div className="text-2xl font-bold text-[var(--orange)]">Impacto Real</div>
                <div className="text-sm text-[color:var(--muted)] font-medium">Resultados para governos e cidadãos</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
