import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export const metadata = { 
  title: "Sobre o InPacta — Instituto de Projetos Avançados",
  description: "Conheça a história, missão e visão do InPacta. Transformando Maringá através da inovação pública e tecnologia para criar uma cidade mais inteligente e conectada.",
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
                <span className="text-white/80 font-medium">O Instituto</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Fortalecendo a <span className="text-[var(--orange)]">governança pública</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                O InPacta é o Instituto de Projetos Avançados para Cidades, Tecnologia e Administração, 
                dedicado ao fortalecimento da governança pública através de inovação, tecnologia e inteligência de dados.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Nosso Propósito</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
              Conheça os pilares que norteiam nossa atuação e compromisso com a transformação digital.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={200} className="grid md:grid-cols-3 gap-8">
          <div className="interactive-card text-center p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Missão</h3>
            <p className="text-[color:var(--muted)] leading-relaxed">
              Fortalecer a governança pública por meio da inovação, tecnologia e inteligência de dados, 
              desenvolvendo políticas, metodologias e soluções que aumentem a eficiência do Estado, ampliem a 
              transparência e transformem serviços públicos em resultados concretos para governos e cidadãos.
            </p>
          </div>

          <div className="interactive-card text-center p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--green)]/5 to-[var(--green)]/10">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--green)]/10 text-[var(--green)] mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Visão</h3>
            <p className="text-[color:var(--muted)] leading-relaxed">
              Ser referência em fortalecimento da governança pública, 
              transformando boas práticas em resultados reais através de soluções inovadoras 
              baseadas em tecnologia e inteligência de dados.
            </p>
          </div>

          <div className="interactive-card text-center p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--orange)]/5 to-[var(--orange)]/10">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--orange)]/10 text-[var(--orange)] mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l3.5 7 7.5 1-5.5 5 1.5 7.5L12 19l-6.5 3.5L7 15l-5.5-5 7.5-1L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Valores</h3>
            <p className="text-[color:var(--muted)] leading-relaxed">
              Governança, inovação, eficiência, efetividade, impacto real e transparência 
              guiam todas as nossas decisões, projetos e entregas para o setor público.
            </p>
          </div>
        </StaggeredReveal>
      </section>

      {/* História */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="fadeRight">
            <div>
              <div className="section-title">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Nossa História</h2>
              </div>
              <div className="mt-8 space-y-6 text-lg leading-relaxed text-[color:var(--muted)]">
                <p>
                  O <strong className="text-[var(--foreground)]">InPacta</strong> nasceu para apoiar gestores e sociedade 
                  na construção de administrações públicas mais modernas, justas e conectadas às demandas sociais.
                </p>
                <p>
                  Existimos para fortalecer a governança pública, oferecendo soluções inovadoras baseadas em 
                  tecnologia e inteligência de dados, que aumentam a eficiência, a transparência e a qualidade 
                  dos serviços públicos.
                </p>
                <p>
                  Atuamos em áreas estratégicas como <strong className="text-[var(--accent)]">segurança pública</strong>, 
                  <strong className="text-[var(--orange)]"> observatórios e inteligência de dados</strong> e 
                  <strong className="text-[var(--green)]"> planejamento estratégico e PMO</strong>, transformando 
                  diagnósticos em ação coordenada e resultados mensuráveis.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeLeft">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--green)]/20 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-[var(--card)] p-8 rounded-3xl border-2 border-[var(--border)]">
                <h3 className="text-2xl font-bold text-[var(--primary)] mb-6">Pilares de Atuação</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center text-[var(--accent)] font-bold text-2xl">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)] mb-1">Governança Aplicada</h4>
                      <p className="text-sm text-[color:var(--muted)]">Estruturas, processos e metodologias para gestão pública eficiente</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[var(--green)]/10 rounded-xl flex items-center justify-center text-[var(--green)] font-bold text-2xl">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)] mb-1">Dados e Inteligência</h4>
                      <p className="text-sm text-[color:var(--muted)]">Observatórios, análise territorial e decisões baseadas em evidências</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[var(--orange)]/10 rounded-xl flex items-center justify-center text-[var(--orange)] font-bold text-2xl">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)] mb-1">Gestão por Resultados</h4>
                      <p className="text-sm text-[color:var(--muted)]">Monitoramento, avaliação e foco em impacto real para cidadãos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Impacto em Números */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Impacto em Números</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
              Resultados concretos que demonstram nosso compromisso com a transformação digital.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "Governança", label: "Foco em\nEstrutura", color: "var(--accent)" },
            { number: "Inovação", label: "Tecnologia\ne Dados", color: "var(--orange)" },
            { number: "Eficiência", label: "Otimização\nde Recursos", color: "var(--green)" },
            { number: "Impacto", label: "Resultados\nReais", color: "var(--primary)" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 p-6 rounded-2xl bg-gradient-to-br from-[var(--card)] to-[var(--background)] border-2 border-[var(--border)]">
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: stat.color }}>
                  {stat.number}
                </div>
                <div className="text-sm text-[color:var(--muted)] font-medium whitespace-pre-line">
                  {stat.label}
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
              Quer saber mais sobre nossos projetos?
            </h2>
            <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
              Conheça nossos serviços, projetos em andamento e como estamos transformando a gestão pública.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/servicos" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Nossos Serviços
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/contato" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Entre em Contato
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
