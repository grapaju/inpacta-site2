import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export const metadata = {
  title: "Governança — InPacta",
  description: "Estrutura organizacional, conselho de administração, processos de governança e diretrizes institucionais do InPacta.",
};

export default function Page() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--orange)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-16 bg-white rounded-full"></div>
                <span className="text-white/80 font-medium">Estrutura Organizacional</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-[var(--orange)]">Governança</span> e liderança
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                Nossa estrutura organizacional garante gestão eficiente, transparente 
                e alinhada aos melhores padrões de governança pública, transformando boas práticas em resultados reais.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Estrutura Organizacional */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Estrutura Organizacional</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
              Organização hierárquica que assegura eficiência operacional e accountability institucional.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={200} className="grid lg:grid-cols-3 gap-8">
          <div className="interactive-card text-center p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Conselho de Administração</h3>
            <p className="text-[color:var(--muted)] leading-relaxed mb-4">
              Órgão superior de deliberação e controle, responsável pelas diretrizes estratégicas e fiscalização.
            </p>
            <div className="text-sm text-[color:var(--muted)]">
              <strong>5 membros</strong> • Mandato de 3 anos
            </div>
          </div>

          <div className="interactive-card text-center p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 8v6M23 11l-3 3-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Diretoria Executiva</h3>
            <p className="text-[color:var(--muted)] leading-relaxed mb-4">
              Gestão operacional e implementação das estratégias definidas pelo conselho de administração.
            </p>
            <div className="text-sm text-[color:var(--muted)]">
              <strong>3 diretores</strong> • Mandato de 2 anos
            </div>
          </div>

          <div className="interactive-card text-center p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--green)]/5 to-[var(--green)]/10">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--green)]/10 text-[var(--green)] mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l3.5 7 7.5 1-5.5 5 1.5 7.5L12 19l-6.5 3.5L7 15l-5.5-5 7.5-1L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Conselho Fiscal</h3>
            <p className="text-[color:var(--muted)] leading-relaxed mb-4">
              Fiscalização contábil, financeira e orçamentária, garantindo conformidade e transparência.
            </p>
            <div className="text-sm text-[color:var(--muted)]">
              <strong>3 membros</strong> • Mandato de 2 anos
            </div>
          </div>
        </StaggeredReveal>
      </section>

      {/* Conselho de Administração */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Conselho de Administração</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Conheça os membros que lideram nossa governança estratégica.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Dr. Carlos Silva",
              position: "Presidente do Conselho",
              background: "PhD em Administração Pública, 20 anos de experiência em gestão municipal",
              image: "/api/placeholder/120/120"
            },
            {
              name: "Dra. Ana Santos",
              position: "Vice-Presidente",
              background: "Especialista em Tecnologia e Inovação, ex-secretária de TI",
              image: "/api/placeholder/120/120"
            },
            {
              name: "Prof. João Oliveira",
              position: "Conselheiro",
              background: "Professor universitário, especialista em Smart Cities",
              image: "/api/placeholder/120/120"
            },
            {
              name: "Dra. Maria Costa",
              position: "Conselheira",
              background: "Advogada especializada em Direito Público e Compliance",
              image: "/api/placeholder/120/120"
            },
            {
              name: "Eng. Pedro Lima",
              position: "Conselheiro",
              background: "Engenheiro de software, 15 anos em projetos públicos",
              image: "/api/placeholder/120/120"
            }
          ].map((member, index) => (
            <div key={index} className="interactive-card bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)] text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--primary)]">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">
                {member.name}
              </h3>
              
              <p className="text-[var(--accent)] font-medium mb-3">
                {member.position}
              </p>
              
              <p className="text-sm text-[color:var(--muted)] leading-relaxed">
                {member.background}
              </p>
            </div>
          ))}
        </StaggeredReveal>
      </section>

      {/* Princípios de Governança */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="fadeRight">
            <div>
              <div className="section-title">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Princípios de Governança</h2>
              </div>
              <div className="mt-8 space-y-6">
                <p className="text-lg text-[color:var(--muted)] leading-relaxed">
                  Nossa governança é fundamentada nos <strong className="text-[var(--foreground)]">melhores padrões</strong> 
                  internacionais de gestão pública e transparência organizacional.
                </p>
                <p className="text-lg text-[color:var(--muted)] leading-relaxed">
                  Seguimos rigorosamente os princípios de accountability, eficiência, 
                  transparência e participação social em todas as nossas atividades.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeLeft">
            <div className="space-y-6">
              {[
                {
                  principle: "Transparência",
                  description: "Divulgação proativa de informações e decisões",
                  color: "var(--accent)"
                },
                {
                  principle: "Accountability",
                  description: "Prestação de contas e responsabilização",
                  color: "var(--green)"
                },
                {
                  principle: "Eficiência",
                  description: "Otimização de recursos e resultados",
                  color: "var(--orange)"
                },
                {
                  principle: "Participação",
                  description: "Envolvimento da sociedade nas decisões",
                  color: "var(--primary)"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-[var(--card)] rounded-xl border-2 border-[var(--border)]">
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">{item.principle}</h4>
                    <p className="text-sm text-[color:var(--muted)]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="scale">
          <div className="text-center bg-gradient-to-br from-[var(--orange)]/10 via-[var(--card)] to-[var(--primary)]/10 rounded-3xl p-12 border-2 border-[var(--orange)]/20">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
              Quer conhecer mais sobre nossa estrutura?
            </h2>
            <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
              Acesse nossos documentos oficiais ou entre em contato para mais informações.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/transparencia" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--orange)] text-white font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Documentos Oficiais
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/contato" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Fale Conosco
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
