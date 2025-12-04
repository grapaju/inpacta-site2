import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export const metadata = {
  title: "Estrutura Organizacional — InPACTA",
  description: "Estrutura organizacional, hierarquia, departamentos e organograma do Instituto de Inovação para Políticas Públicas de Maringá.",
};

export default function Page() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-16 bg-white rounded-full"></div>
                <span className="text-white/80 font-medium">Organização</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Estrutura <span style={{ color: '#ff6b35' }}>Organizacional</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                Conheça nossa estrutura organizacional voltada ao fortalecimento da governança pública, 
                com foco em soluções inovadoras baseadas em tecnologia e inteligência de dados.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Organograma */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Organograma Institucional</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
              Estrutura hierárquica e organizacional que garante eficiência e transparência.
            </p>
          </div>
        </ScrollReveal>

        {/* Direção Geral */}
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white p-8 rounded-2xl">
              <div className="mb-4">
                <div className="size-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9l-5 4.87 1.18 6.88L12 17.77l-6.18 3.98L7 14.87 2 10l6.91-1.74L12 2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Direção Geral</h3>
                <p className="text-white/80 text-sm">Liderança estratégica e institucional</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Departamentos */}
        <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: "Departamento de Tecnologia",
              subtitle: "Inovação e Desenvolvimento",
              areas: [
                "Desenvolvimento de Software",
                "Infraestrutura de TI",
                "Segurança da Informação",
                "Suporte Técnico"
              ],
              color: "var(--primary)",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            },
            {
              title: "Departamento de Projetos",
              subtitle: "Gestão e PMO",
              areas: [
                "Gestão de Portfólio",
                "Metodologias Ágeis",
                "Controle de Qualidade",
                "Planejamento Estratégico"
              ],
              color: "var(--accent)",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            },
            {
              title: "Departamento Administrativo",
              subtitle: "Operações e Recursos",
              areas: [
                "Recursos Humanos",
                "Financeiro",
                "Compras e Contratos",
                "Comunicação"
              ],
              color: "var(--green)",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            }
          ].map((dept, index) => (
            <div key={index} className="interactive-card bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)]">
              <div className="text-center mb-6">
                <div 
                  className="inline-flex size-16 items-center justify-center rounded-2xl mb-4"
                  style={{ backgroundColor: `${dept.color}15`, color: dept.color }}
                >
                  {dept.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--primary)] mb-2">
                  {dept.title}
                </h3>
                <p className="text-sm text-[color:var(--muted)]">
                  {dept.subtitle}
                </p>
              </div>
              
              <div className="space-y-3">
                {dept.areas.map((area, areaIndex) => (
                  <div key={areaIndex} className="flex items-center gap-3">
                    <div 
                      className="size-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dept.color }}
                    ></div>
                    <span className="text-sm text-[var(--foreground)]">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </StaggeredReveal>

        {/* Conexões visuais */}
        <div className="flex justify-center mb-12">
          <div className="w-px h-16 bg-gradient-to-b from-[var(--border)] to-transparent"></div>
        </div>
      </section>

      {/* Núcleos Especializados — ocultado temporariamente */}
      {/* Conteúdo removido conforme solicitação; manteremos para uso futuro. */}

      {/* Comitês Estratégicos e Conselho Consultivo — ocultados temporariamente */}

      {/* CTA */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="scale">
            <div className="text-center bg-gradient-to-br from-[var(--primary)]/10 via-[var(--card)] to-[var(--accent)]/10 rounded-3xl p-12 border-2 border-[var(--primary)]/20">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
                Faça parte da nossa equipe
              </h2>
              <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
                Estamos sempre em busca de talentos para fortalecer nossa estrutura e missão.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contato" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--primary)] text-white font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Trabalhe Conosco
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/sobre" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Conheça Nossa História
              </Link>
            </div>
          </div>
        </ScrollReveal>
        </section>
      </div>
    </div>
  );
}