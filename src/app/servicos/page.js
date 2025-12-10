import Link from "next/link";
import { services } from "@/data/services";
import { IconCity, IconCpu, IconLightbulb, IconShield } from "@/components/Icons";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export const metadata = { title: "Serviços • InPACTA" };

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}

      {/* Serviços Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Nossas Soluções</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Expertise em tecnologia aplicada ao setor público.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={200} className="grid md:grid-cols-3 gap-8">
          {services.map((service) => {
            const serviceConfig = getServiceConfig(service.slug);
            return (
              <article key={service.slug} className="interactive-card group bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="inline-flex size-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: `${serviceConfig.color}1A`, color: serviceConfig.color }}
                    >
                      <serviceConfig.Icon width={32} height={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--primary)] group-hover:text-[var(--accent)] transition-colors">
                        {service.title}
                      </h3>
                      <span className="text-sm text-[color:var(--muted)]">
                        {service.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[color:var(--muted)] leading-relaxed mb-6">
                    {service.description}
                  </p>
                  
                  <Link 
                    href={`/servicos/${service.slug}`}
                    className="inline-flex items-center gap-2 font-semibold text-[var(--accent)] hover:gap-3 transition-all ring-focus group/link"
                  >
                    Saiba mais
                    <span className="transition-transform group-hover/link:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </StaggeredReveal>
      </section>

      {/* CTA Section */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="scale">
            <div className="text-center bg-gradient-to-br from-[var(--accent)]/10 via-[var(--card)] to-[var(--primary)]/10 rounded-3xl p-12 border-2 border-[var(--accent)]/20">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
                Precisa de uma solução personalizada?
              </h2>
              <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
                Nossa equipe está pronta para desenvolver soluções sob medida 
                para as necessidades específicas da sua organização.
              </p>
            <Link 
              href="/contato"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-white font-semibold rounded-xl hover:scale-105 transition-transform ring-focus"
            >
              Entre em contato
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M7 17l9.2-9.2M17 17V7H7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Link>
          </div>
        </ScrollReveal>
        </section>
      </div>
    </div>
  );
}

// Helper functions
function getServiceConfig(slug) {
  const configs = {
    "governanca-seguranca-publica": { color: "#0A2540", Icon: IconShield },
    "observatorios-inteligencia-dados": { color: "#3a6fa6", Icon: IconCpu },
    "planejamento-estrategico-pmo": { color: "#FF6B35", Icon: IconLightbulb },
    "govtech-digitalizacao": { color: "#3a6fa6", Icon: IconCpu },
    "smart-cities": { color: "#27AE60", Icon: IconCity },
    "pmo-projetos": { color: "#FF6B35", Icon: IconLightbulb },
  };
  return configs[slug] || { color: "#0A2540", Icon: IconShield };
}
