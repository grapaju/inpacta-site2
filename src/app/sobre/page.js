import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export const metadata = { 
  title: "Sobre o InPACTA — Instituto de Projetos Avançados",
  description: "Conheça o InPACTA: fortalecemos a governança pública através de inovação, tecnologia e inteligência de dados, transformando serviços públicos em resultados concretos para governos e cidadãos.",
};

export default function Page() {
  return (
    <div>
      <div hidden>DEPLOY-MARKER-20251110-1</div>
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
                Fortalecendo a <span style={{ color: '#ff6b35' }}>governança pública</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                O InPACTA é o Instituto de Projetos Avançados para Cidades, Tecnologia e Administração, 
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

        <StaggeredReveal staggerDelay={200} className="grid md:grid-cols-3 gap-8 items-stretch">
          <div className="interactive-card text-center p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/5 to-[var(--accent)]/10 flex flex-col h-full">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] mb-6 mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Missão</h3>
            <p className="text-[color:var(--muted)] leading-relaxed flex-1">
              Fortalecer a governança pública por meio da inovação, tecnologia e inteligência de dados, 
              desenvolvendo políticas, metodologias e soluções que aumentem a eficiência do Estado, ampliem a 
              transparência e transformem serviços públicos em resultados concretos para governos e cidadãos.
            </p>
          </div>

          <div className="interactive-card text-center p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--green)]/5 to-[var(--green)]/10 flex flex-col h-full">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--green)]/10 text-[var(--green)] mb-6 mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Visão</h3>
            <p className="text-[color:var(--muted)] leading-relaxed flex-1">
              Consolidar-se como referência em governança pública e inovação, liderando a modernização da 
              gestão por meio de tecnologia, inteligência de dados e participação social, para gerar soluções 
              eficientes, transparentes e sustentáveis que transformem administrações e inspirem confiança da sociedade.
            </p>
          </div>

          <div className="interactive-card text-center p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--orange)]/5 to-[var(--orange)]/10 flex flex-col h-full">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[var(--orange)]/10 text-[var(--orange)] mb-6 mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l3.5 7 7.5 1-5.5 5 1.5 7.5L12 19l-6.5 3.5L7 15l-5.5-5 7.5-1L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Valores</h3>
            <p className="text-[color:var(--muted)] leading-relaxed flex-1">
              Transparência, comprometimento com resultados públicos, inovação a serviço da governança, 
              ética e integridade, colaboração e sustentabilidade institucional guiam todas as nossas decisões e entregas.
            </p>
          </div>
        </StaggeredReveal>
      </section>

      {/* Valores Detalhados */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="fadeUp">
            <div className="text-center mb-16">
              <div className="section-title justify-center">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Nossos Valores</h2>
              </div>
              <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
                Princípios que orientam nossa atuação e compromisso com a excelência na gestão pública.
              </p>
            </div>
          </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="space-y-6">
          <div className="interactive-card p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/5 to-transparent">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)] font-bold text-2xl">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3">Transparência e Prestação de Contas</h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Tornar informações, processos e resultados acessíveis, assegurando clareza, integridade e controle 
                  social sobre as ações do Instituto e de seus parceiros.
                </p>
              </div>
            </div>
          </div>

          <div className="interactive-card p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--green)]/5 to-transparent">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 bg-[var(--green)]/10 rounded-2xl flex items-center justify-center text-[var(--green)] font-bold text-2xl">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3">Comprometimento com Resultados Públicos</h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Direcionar esforços para gerar valor efetivo à gestão pública e à sociedade, com entregas claras, 
                  mensuráveis e sustentáveis.
                </p>
              </div>
            </div>
          </div>

          <div className="interactive-card p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--orange)]/5 to-transparent">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 bg-[var(--orange)]/10 rounded-2xl flex items-center justify-center text-[var(--orange)] font-bold text-2xl">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3">Inovação a Serviço da Governança</h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Utilizar tecnologia, inteligência de dados e metodologias modernas de forma responsável, fortalecendo 
                  a governança pública, promovendo eficiência, integridade e decisões baseadas em evidências.
                </p>
              </div>
            </div>
          </div>

          <div className="interactive-card p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/5 to-transparent">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center text-[var(--primary)] font-bold text-2xl">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3">Ética, Integridade e Independência</h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Atuar com imparcialidade e neutralidade institucional, respeitando a legislação e padrões éticos, 
                  blindando a atuação contra interesses que comprometam a missão.
                </p>
              </div>
            </div>
          </div>

          <div className="interactive-card p-8 rounded-2xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/5 to-transparent">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)] font-bold text-2xl">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3">Colaboração e Sustentabilidade Institucional</h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Promover cooperação entre governos, sociedade civil e setor privado, construindo soluções conjuntas 
                  que equilibrem eficiência, inclusão social e responsabilidade com o futuro.
                </p>
              </div>
            </div>
          </div>
        </StaggeredReveal>
        </section>
      </div>

      {/* História */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="fadeRight">
            <div>
              <div className="section-title">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Nossa História</h2>
              </div>
              <div className="mt-8 space-y-6 text-lg leading-relaxed text-[color:var(--muted)]">
                <p>
                  O <strong className="text-[var(--foreground)]">InPACTA</strong> nasceu para apoiar gestores e sociedade 
                  na construção de administrações públicas mais modernas, justas e conectadas às demandas sociais.
                </p>
                <p>
                  Com governança como eixo central de nossa atuação, 
                  utilizamos inovação e tecnologia como meios para 
                  fortalecer a gestão pública, desenvolver políticas baseadas em evidências e metodologias que 
                  aumentam a eficiência do Estado.
                </p>
                <p>
                  Nosso trabalho gera <strong>resultados concretos</strong> tanto no 
                  âmbito institucional quanto social, ampliando a transparência, fortalecendo a participação cidadã 
                  e inspirando confiança da sociedade nas instituições públicas.
                </p>
                <p>
                  Atuamos em áreas estratégicas como <strong>segurança pública</strong>, 
                  <strong > observatórios e inteligência de dados</strong> e 
                  <strong> planejamento estratégico e PMO</strong>, transformando 
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
                      <h4 className="font-semibold text-[var(--foreground)] mb-1">Governança Pública</h4>
                      <p className="text-sm text-[color:var(--muted)]">Fortalecimento institucional, políticas públicas e processos de gestão alinhados às melhores práticas internacionais</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[var(--orange)]/10 rounded-xl flex items-center justify-center text-[var(--orange)] font-bold text-2xl">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)] mb-1">Inovação e Tecnologia</h4>
                      <p className="text-sm text-[color:var(--muted)]">Transformação digital, inteligência de dados e soluções tecnológicas para modernização da gestão pública</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[var(--green)]/10 rounded-xl flex items-center justify-center text-[var(--green)] font-bold text-2xl">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)] mb-1">Transparência e Participação Social</h4>
                      <p className="text-sm text-[color:var(--muted)]">Prestação de contas, controle social e engajamento cidadão para fortalecer a confiança nas instituições</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)] font-bold text-2xl">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)] mb-1">Resultados e Sustentabilidade</h4>
                      <p className="text-sm text-[color:var(--muted)]">Entregas mensuráveis, eficiência na gestão de recursos e impacto social sustentável</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Diferenciais Estratégicos */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="fadeUp">
            <div className="text-center mb-16">
              <div className="section-title justify-center">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Nossos Diferenciais</h2>
              </div>
              <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
                Palavras-chave que definem nosso compromisso com a excelência em governança pública.
              </p>
            </div>
          </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { 
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              title: "Eficiência", 
              description: "Otimização de recursos e processos", 
              color: "var(--accent)" 
            },
            { 
              icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
              title: "Transparência", 
              description: "Clareza e prestação de contas", 
              color: "var(--orange)" 
            },
            { 
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
              title: "Inovação", 
              description: "Tecnologia a serviço do público", 
              color: "var(--green)" 
            },
            { 
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              title: "Integridade", 
              description: "Ética e independência", 
              color: "var(--primary)" 
            },
            { 
              icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              title: "Resultados", 
              description: "Entregas mensuráveis e concretas", 
              color: "var(--accent)" 
            },
            { 
              icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
              title: "Colaboração", 
              description: "Parcerias multisetoriais", 
              color: "var(--orange)" 
            },
            { 
              icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              title: "Sustentabilidade", 
              description: "Responsabilidade com o futuro", 
              color: "var(--green)" 
            },
            { 
              icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
              title: "Governança", 
              description: "Alinhamento OCDE e BID", 
              color: "var(--primary)" 
            }
          ].map((item, index) => (
            <div key={index} className="text-center interactive-card p-6 rounded-2xl bg-gradient-to-br from-[var(--card)] to-[var(--background)] border-2 border-[var(--border)]">
              <div className="size-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[var(--accent)]/10 to-transparent flex items-center justify-center" style={{ borderColor: item.color, borderWidth: '2px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: item.color }}>
                {item.title}
              </h3>
              <p className="text-sm text-[color:var(--muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </StaggeredReveal>
        </section>
      </div>

      {/* CTA */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="scale">
            <div className="text-center bg-gradient-to-br from-[var(--accent)]/10 via-[var(--card)] to-[var(--green)]/10 rounded-3xl p-12 border-2 border-[var(--accent)]/20">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
                Nossos Serviços
              </h2>
              <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
                Conheça as linhas de atuação do InPACTA para apoiar a modernização administrativa, governança por dados e interoperabilidade no setor público.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/servicos" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Ver serviços
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/contato" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Fale conosco
              </Link>
            </div>
          </div>
        </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
