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
      <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--green)] text-white relative overflow-hidden">
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

        <div className="grid lg:grid-cols-3 gap-6">
          <StaggeredReveal staggerDelay={100} className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80">
            <div
              className="inline-flex w-12 h-12 items-center justify-center rounded-xl border-2 mb-5"
              style={{ borderColor: "var(--accent)30", backgroundColor: "var(--accent)12", color: "var(--accent)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Missão</h3>
            <p className="text-[color:var(--muted)] leading-relaxed flex-1">
              Fortalecer a governança pública por meio da inovação, tecnologia e inteligência de dados, 
              desenvolvendo políticas, metodologias e soluções que aumentem a eficiência do Estado, ampliem a 
              transparência e transformem serviços públicos em resultados concretos para governos e cidadãos.
            </p>
          </StaggeredReveal>

          <StaggeredReveal staggerDelay={150} className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80">
            <div
              className="inline-flex w-12 h-12 items-center justify-center rounded-xl border-2 mb-5"
              style={{ borderColor: "var(--green)30", backgroundColor: "var(--green)12", color: "var(--green)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Visão</h3>
            <p className="text-[color:var(--muted)] leading-relaxed">
              Consolidar-se como referência em governança pública e inovação, liderando a modernização da 
              gestão por meio de tecnologia, inteligência de dados e participação social, para gerar soluções 
              eficientes, transparentes e sustentáveis que transformem administrações e inspirem confiança da sociedade.
            </p>
          </StaggeredReveal>

          <StaggeredReveal staggerDelay={200} className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80">
            <div
              className="inline-flex w-12 h-12 items-center justify-center rounded-xl border-2 mb-5"
              style={{ borderColor: "var(--orange)30", backgroundColor: "var(--orange)12", color: "var(--orange)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Valores</h3>
            <p className="text-[color:var(--muted)] leading-relaxed">
              Transparência, comprometimento com resultados públicos, inovação a serviço da governança, 
              ética e integridade, colaboração e sustentabilidade institucional guiam todas as nossas decisões e entregas.
            </p>
          </StaggeredReveal>
        </div>
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

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-lg">
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

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-lg">
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

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-lg">
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

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-lg">
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

          <div className="lg:col-span-2 bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-lg">
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
        </div>
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
            <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80">
              <h3 className="text-2xl font-bold text-[var(--primary)] mb-6">Pilares de Atuação</h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-semibold text-base">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">Governança Pública</h4>
                    <p className="text-sm text-[color:var(--muted)]">Fortalecimento institucional, políticas públicas e processos de gestão alinhados às melhores práticas internacionais</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-semibold text-base">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">Inovação e Tecnologia</h4>
                    <p className="text-sm text-[color:var(--muted)]">Transformação digital, inteligência de dados e soluções tecnológicas para modernização da gestão pública</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-semibold text-base">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">Transparência e Participação Social</h4>
                    <p className="text-sm text-[color:var(--muted)]">Prestação de contas, controle social e engajamento cidadão para fortalecer a confiança nas instituições</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-semibold text-base">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">Resultados e Sustentabilidade</h4>
                    <p className="text-sm text-[color:var(--muted)]">Entregas mensuráveis, eficiência na gestão de recursos e impacto social sustentável</p>
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-5 md:p-6 transition-colors hover:border-[var(--border)]/80 text-center">
            <div className="size-12 md:size-14 mx-auto mb-3 md:mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2 text-[var(--primary)]">Eficiência</h3>
            <p className="text-xs md:text-sm text-[color:var(--muted)]">Otimização de recursos e processos</p>
          </div>

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-5 md:p-6 transition-colors hover:border-[var(--border)]/80 text-center">
            <div className="size-12 md:size-14 mx-auto mb-3 md:mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2 text-[var(--primary)]">Transparência</h3>
            <p className="text-xs md:text-sm text-[color:var(--muted)]">Clareza e prestação de contas</p>
          </div>

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-5 md:p-6 transition-colors hover:border-[var(--border)]/80 text-center">
            <div className="size-12 md:size-14 mx-auto mb-3 md:mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2 text-[var(--primary)]">Inovação</h3>
            <p className="text-xs md:text-sm text-[color:var(--muted)]">Tecnologia a serviço do público</p>
          </div>

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-5 md:p-6 transition-colors hover:border-[var(--border)]/80 text-center">
            <div className="size-12 md:size-14 mx-auto mb-3 md:mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2 text-[var(--primary)]">Integridade</h3>
            <p className="text-xs md:text-sm text-[color:var(--muted)]">Ética e independência</p>
          </div>

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-5 md:p-6 transition-colors hover:border-[var(--border)]/80 text-center">
            <div className="size-12 md:size-14 mx-auto mb-3 md:mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 17l-5-5-4 4-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2 text-[var(--primary)]">Resultados</h3>
            <p className="text-xs md:text-sm text-[color:var(--muted)]">Entregas mensuráveis e concretas</p>
          </div>

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-5 md:p-6 transition-colors hover:border-[var(--border)]/80 text-center">
            <div className="size-12 md:size-14 mx-auto mb-3 md:mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2 text-[var(--primary)]">Colaboração</h3>
            <p className="text-xs md:text-sm text-[color:var(--muted)]">Parcerias multisetoriais</p>
          </div>

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-5 md:p-6 transition-colors hover:border-[var(--border)]/80 text-center">
            <div className="size-12 md:size-14 mx-auto mb-3 md:mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7.5 19.79 7.5 14.6 3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="21 12 16.5 14.6 16.5 19.79" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2 text-[var(--primary)]">Sustentabilidade</h3>
            <p className="text-xs md:text-sm text-[color:var(--muted)]">Responsabilidade com o futuro</p>
          </div>

          <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-5 md:p-6 transition-colors hover:border-[var(--border)]/80 text-center">
            <div className="size-12 md:size-14 mx-auto mb-3 md:mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2 text-[var(--primary)]">Governança</h3>
            <p className="text-xs md:text-sm text-[color:var(--muted)]">Alinhamento OCDE e BID</p>
          </div>
        </div>
        </section>
      </div>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="scale">
          <div className="bg-gradient-to-br from-[var(--primary)]/5 via-[var(--card)] to-[var(--green)]/5 rounded-3xl p-10 md:p-12 border-2 border-[var(--primary)]/20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
              Nossos Serviços
            </h2>
            <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
              Conheça as linhas de atuação do InPACTA para apoiar a modernização administrativa, governança por dados e interoperabilidade no setor público.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/servicos" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity ring-focus group"
              >
                Ver serviços
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/contato" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] bg-[var(--card)] font-semibold hover:bg-[var(--background)] transition-colors ring-focus"
              >
                Fale conosco
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
