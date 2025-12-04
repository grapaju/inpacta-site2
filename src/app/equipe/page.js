import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export const metadata = {
  title: "Equipe e Práticas — InPACTA",
  description: "Conheça nossa equipe especializada, metodologias de trabalho e práticas inovadoras do Instituto de Inovação para Políticas Públicas de Maringá.",
};

export default function Page() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-16 bg-white rounded-full"></div>
                <span className="text-white/80 font-medium">Pessoas & Processos</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Nossa <span style={{ color: '#ff6b35' }}>Equipe</span> e Práticas
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                Conheça os profissionais especializados e as metodologias que fortalecem 
                a governança pública através de inovação, tecnologia e inteligência de dados.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Estatísticas da Equipe — OCULTADO TEMPORARIAMENTE */}
      {false && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="fadeUp">
            <div className="text-center mb-16">
              <div className="section-title justify-center">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Números da Equipe</h2>
              </div>
              <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
                Profissionais qualificados trabalhando com metodologias ágeis e inovadoras.
              </p>
            </div>
          </ScrollReveal>

          <StaggeredReveal staggerDelay={150} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "45+", label: "Profissionais", icon: "users", color: "var(--primary)" },
              { number: "8", label: "Especialidades", icon: "layers", color: "var(--accent)" },
              { number: "15+", label: "Anos de Experiência", icon: "award", color: "var(--green)" },
              { number: "100%", label: "Metodologias Ágeis", icon: "zap", color: "var(--orange)" },
            ].map((stat, index) => (
              <div key={index} className="interactive-card text-center p-6 rounded-2xl bg-[var(--card)] border-2 border-[var(--border)]">
                <div 
                  className="inline-flex size-16 items-center justify-center rounded-2xl mb-4"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  {stat.icon === "users" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                  {stat.icon === "layers" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <polygon points="12,2 2,7 12,12 22,7" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="2,17 12,22 22,17" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="2,12 12,17 22,12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                  {stat.icon === "award" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                  {stat.icon === "zap" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>
                  {stat.number}
                </div>
                <div className="text-sm text-[color:var(--muted)] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </StaggeredReveal>
        </section>
      )}

      {/* Liderança */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="fadeUp">
            <div className="text-center mb-16">
              <div className="section-title justify-center">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Liderança</h2>
              </div>
              <p className="mt-4 text-lg text-[color:var(--muted)]">
                Profissionais capacitados que lideram nossa missão de inovação.
              </p>
            </div>
          </ScrollReveal>

        <StaggeredReveal staggerDelay={200} className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Cristiane Regina de Camargo Hasegawa", role: "Diretora Presidente" },
            { name: "Ideuber Carlos Celeste", role: "Diretor Administrativo Financeiro" },
            { name: "Márcio Luis Catelan", role: "Diretor Técnico" }
          ].map((leader, index) => (
            <div key={index} className="interactive-card bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)] h-full flex flex-col">
              <div className="text-center mb-4">
                <div className="size-20 bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {leader.name?.[0]}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[var(--primary)] mb-1">
                  {leader.name}
                </h3>
                <p className="text-[var(--accent)] font-medium">
                  {leader.role}
                </p>
              </div>
              <div className="mt-auto" />
            </div>
          ))}
        </StaggeredReveal>
        </section>
      </div>

      {/* Equipes por Área */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Equipes Especializadas</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Profissionais organizados por áreas de expertise e atuação.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              area: "Desenvolvimento",
              members: 12,
              description: "Full-stack developers, arquitetos de software e especialistas em cloud.",
              technologies: ["React", "Node.js", "Python", "Docker", "AWS"],
              color: "var(--primary)",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polyline points="16,18 22,12 16,6" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="8,6 2,12 8,18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            },
            {
              area: "UX/UI Design",
              members: 6,
              description: "Designers especializados em experiência do usuário e interfaces públicas.",
              technologies: ["Figma", "Adobe XD", "Sketch", "Prototyping", "Research"],
              color: "var(--accent)",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            },
            {
              area: "Dados e Analytics",
              members: 8,
              description: "Cientistas de dados, analistas e especialistas em business intelligence.",
              technologies: ["Python", "R", "Power BI", "Tableau", "SQL"],
              color: "var(--green)",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2"/>
                  <path d="M18 17V9M13 17V5M8 17v-3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            },
            {
              area: "DevOps & Infraestrutura",
              members: 5,
              description: "Especialistas em infraestrutura, automação e segurança de sistemas.",
              technologies: ["Kubernetes", "Jenkins", "Terraform", "AWS", "Security"],
              color: "var(--orange)",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )
            }
          ].map((team, index) => (
            <div key={index} className="interactive-card bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)] h-full flex flex-col">
              <div className="mb-4">
                <div 
                  className="inline-flex size-12 items-center justify-center rounded-xl mb-4"
                  style={{ backgroundColor: `${team.color}15`, color: team.color }}
                >
                  {team.icon}
                </div>
                
                <h3 className="text-lg font-bold text-[var(--primary)] mb-2">
                  {team.area}
                </h3>
                
                <div 
                  className="text-sm font-medium px-3 py-1 rounded-full inline-block mb-3"
                  style={{ backgroundColor: `${team.color}15`, color: team.color }}
                >
                  {team.members} profissionais
                </div>
                
                <p className="text-sm text-[color:var(--muted)] leading-relaxed mb-4">
                  {team.description}
                </p>
              </div>
              
              <div className="mt-auto">
                <h4 className="text-sm font-bold text-[var(--primary)] mb-2">Tecnologias</h4>
                <div className="flex flex-wrap gap-1">
                  {team.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="text-xs px-2 py-1 bg-[var(--background)] text-[var(--foreground)] rounded border border-[var(--border)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </StaggeredReveal>
      </section>

      {/* Metodologias e Práticas — OCULTADO TEMPORARIAMENTE */}
      {false && (
        <div className="section-alt">
          <section className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal animation="fadeRight">
                <div>
                  <div className="section-title">
                    <span className="bar" />
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Metodologias de Trabalho</h2>
                  </div>
                  <div className="mt-8 space-y-6">
                    <p className="text-lg text-[color:var(--muted)] leading-relaxed">
                      Utilizamos as <strong className="text-[var(--foreground)]">melhores práticas</strong> da indústria, 
                      adaptadas às necessidades específicas do setor público.
                    </p>
                  
                  <div className="space-y-4">
                    {[
                      {
                        title: "Metodologias Ágeis",
                        description: "Scrum, Kanban e SAFe para entregas iterativas e adaptabilidade."
                      },
                      {
                        title: "DevOps Culture",
                        description: "Integração contínua, entrega contínua e colaboração entre equipes."
                      },
                      {
                        title: "Design Thinking",
                        description: "Centrado no usuário para criar soluções inovadoras e eficazes."
                      },
                      {
                        title: "Lean Startup",
                        description: "Desenvolvimento enxuto com validação rápida de hipóteses."
                      }
                    ].map((methodology, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="size-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h3 className="font-bold text-[var(--primary)] mb-1">{methodology.title}</h3>
                          <p className="text-sm text-[color:var(--muted)]">{methodology.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fadeLeft">
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-[var(--accent)]/10 via-[var(--card)] to-[var(--green)]/10 p-8 rounded-2xl border-2 border-[var(--accent)]/20">
                  <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Certificações da Equipe</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "PMP - Project Management",
                      "Scrum Master Certified",
                      "AWS Solutions Architect",
                      "Google Cloud Professional",
                      "UX Design Certified",
                      "DevOps Foundation"
                    ].map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="size-2 bg-[var(--green)] rounded-full"></div>
                        <span className="text-sm text-[var(--foreground)]">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)]">
                  <h3 className="text-lg font-bold text-[var(--primary)] mb-3">Desenvolvimento Contínuo</h3>
                  <p className="text-sm text-[color:var(--muted)] mb-4">
                    Investimos constantemente na capacitação de nossa equipe através de:
                  </p>
                  <ul className="space-y-2 text-sm text-[var(--foreground)]">
                    <li>• Treinamentos técnicos regulares</li>
                    <li>• Participação em conferências</li>
                    <li>• Certificações internacionais</li>
                    <li>• Workshops internos</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>
          </section>
        </div>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="scale">
          <div className="text-center bg-gradient-to-br from-[var(--accent)]/10 via-[var(--card)] to-[var(--primary)]/10 rounded-3xl p-12 border-2 border-[var(--accent)]/20">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
              Junte-se à nossa equipe
            </h2>
            <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
              Estamos sempre em busca de talentos apaixonados por inovação e transformação digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contato" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Oportunidades de Carreira
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/estrutura" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Ver Estrutura Organizacional
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}