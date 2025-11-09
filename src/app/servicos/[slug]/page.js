import { services } from "@/data/services";
import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = services.find((s) => s.slug === slug);
  if (!item) return { title: "Serviço • InPacta" };
  return { title: `${item.title} • InPacta`, description: item.description };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const item = services.find((s) => s.slug === slug);
  
  if (!item) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-[var(--primary)] mb-4">Serviço não encontrado</h1>
        <Link href="/servicos" className="text-[var(--accent)] hover:underline">← Voltar para serviços</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--accent)] to-[var(--green)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <Link 
                  href="/servicos"
                  className="text-white/80 hover:text-white font-medium transition-colors"
                >
                  ← Serviços
                </Link>
                <div className="h-1 w-16 bg-white rounded-full"></div>
                <span className="text-white/80 font-medium">{item.category}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {item.hero.title}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                {item.hero.subtitle}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Overview */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="fadeRight">
            <div>
              <div className="section-title">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Visão Geral</h2>
              </div>
              <p className="mt-8 text-lg text-[color:var(--muted)] leading-relaxed">
                {item.overview}
              </p>
              
              <div className="mt-8">
                <h3 className="text-lg font-bold text-[var(--primary)] mb-4">Principais Benefícios</h3>
                <div className="space-y-3">
                  {item.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="flex-shrink-0 size-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="text-[var(--foreground)]">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeLeft">
            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-8 rounded-3xl border-2 border-[var(--border)]">
              <h3 className="text-lg font-bold text-[var(--primary)] mb-6">Tecnologias Utilizadas</h3>
              <div className="flex flex-wrap gap-2">
                {item.technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="px-3 py-2 text-sm font-medium rounded-lg"
                    style={{ 
                      backgroundColor: `${item.color}15`, 
                      color: item.color 
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="size-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    {getServiceIcon(item.icon)}
                  </div>
                  <div>
                    <div className="font-bold text-[var(--primary)]">{item.title}</div>
                    <div className="text-sm text-[color:var(--muted)]">{item.category}</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Principais Recursos</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Funcionalidades e capacidades que tornam nossos serviços únicos.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-2 gap-8">
          {item.features.map((feature, index) => (
            <div key={index} className="interactive-card bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)]">
              <div 
                className="inline-flex size-16 items-center justify-center rounded-2xl mb-6"
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                {getFeatureIcon(feature.icon)}
              </div>
              <h3 className="text-xl font-bold text-[var(--primary)] mb-4">
                {feature.title}
              </h3>
              <p className="text-[color:var(--muted)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </StaggeredReveal>
      </section>

      {/* Cases */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Casos de Sucesso</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Projetos reais que demonstram o impacto de nossas soluções.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={200} className="grid md:grid-cols-2 gap-8">
          {item.cases.map((caseStudy, index) => (
            <div key={index} className="interactive-card bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-8 rounded-2xl border-2 border-[var(--border)]">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3">
                  {caseStudy.title}
                </h3>
                <p className="text-[color:var(--muted)] leading-relaxed mb-4">
                  {caseStudy.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div 
                  className="text-sm font-bold"
                  style={{ color: item.color }}
                >
                  Impacto: {caseStudy.impact}
                </div>
                <div 
                  className="size-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </StaggeredReveal>
      </section>

      {/* CTA */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="scale">
          <div className="text-center bg-gradient-to-br from-[var(--accent)]/10 via-[var(--card)] to-[var(--green)]/10 rounded-3xl p-12 border-2 border-[var(--accent)]/20">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
              Interessado em {item.title}?
            </h2>
            <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
              Entre em contato conosco para saber como podemos ajudar sua organização com {item.title.toLowerCase()}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contato" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Falar com Especialista
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/servicos" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Ver Outros Serviços
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

// Helper function for service icons
function getServiceIcon(iconType) {
  const iconMap = {
    monitor: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    city: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18M5 21V7l4-4 4 4v14M13 9h6v12M9 9v1M9 12v1M9 15v1M16 12v1M16 15v1" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    project: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  };
  
  return iconMap[iconType] || iconMap.monitor;
}

// Helper function for feature icons
function getFeatureIcon(iconType) {
  const iconMap = {
    automation: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1.73c.34-.6.99-1 1.73-1a2 2 0 0 1 0 4c-.74 0-1.39-.4-1.73-1H20a7 7 0 0 1-7 7v1.73c.6.34 1 .99 1 1.73a2 2 0 0 1-4 0c0-.74.4-1.39 1-1.73V17H10a7 7 0 0 1-7-7H1.27C.93 10.6.34 11 .6 11a2 2 0 0 1 0-4c.74 0 1.39.4 1.73 1H3a7 7 0 0 1 7-7h1V5.73C10.4 5.39 10 4.74 10 4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    integration: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
        <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    portal: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 1v6M15 1v6M9 17v6M15 17v6M1 9h6M17 9h6M1 15h6M17 15h6" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    analytics: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2"/>
        <path d="M18 17V9M13 17V5M8 17v-3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    sensors: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a3 3 0 0 0-3 3c0 .73.26 1.4.69 1.92L7.5 9.11a3 3 0 0 0-4.31.78 3 3 0 0 0 .78 4.31l2.19 2.19A3 3 0 0 0 5 18a3 3 0 1 0 3-3c-.73 0-1.4.26-1.92.69l-2.19-2.19a3 3 0 0 0 .78-4.31 3 3 0 0 0 4.31-.78l2.19 2.19c-.43.52-.69 1.19-.69 1.92a3 3 0 1 0 3-3z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    transport: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" stroke="currentColor" strokeWidth="2"/>
        <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" stroke="currentColor" strokeWidth="2"/>
        <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6-6h15m-6 0v-5" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    energy: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    environment: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    portfolio: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    agile: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    governance: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    digital: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
        <path d="M7 7h5M7 11h3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  };
  
  return iconMap[iconType] || iconMap.automation;
}
