import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export const metadata = {
  title: "Dados e Indicadores — InPacta",
  description: "Portal de dados abertos, indicadores urbanos, estatísticas e dashboards da cidade de Maringá. Acesso público a informações estruturadas.",
};

export default function Page() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--accent)] to-[var(--green)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-16 bg-white rounded-full"></div>
                <span className="text-white/80 font-medium">Portal de Dados</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-[var(--green)]">Dados</span> que transformam a cidade
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                Acesso aberto a indicadores urbanos, estatísticas municipais 
                e dados estruturados para análise e desenvolvimento de soluções.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Estatísticas Principais */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Indicadores da Cidade</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-2xl mx-auto">
              Principais métricas e indicadores que demonstram o desenvolvimento de Maringá.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "450K", label: "População", icon: "users", color: "var(--primary)" },
            { number: "96%", label: "Cobertura Digital", icon: "wifi", color: "var(--accent)" },
            { number: "320", label: "Serviços Digitais", icon: "monitor", color: "var(--green)" },
            { number: "4.8", label: "Índice de Satisfação", icon: "star", color: "var(--orange)" },
          ].map((stat, index) => (
            <div key={index} className="interactive-card text-center p-6 rounded-2xl bg-[var(--card)] border-2 border-[var(--border)]">
              <div 
                className="inline-flex size-16 items-center justify-center rounded-2xl mb-4"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon === "users" && (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {stat.icon === "wifi" && (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="currentColor" strokeWidth="2"/>
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="2"/>
                    <point cx="12" cy="20" r="1" fill="currentColor"/>
                  </svg>
                )}
                {stat.icon === "monitor" && (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {stat.icon === "star" && (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="12,2 15.09,8.26 22,9 17,14 18.18,21 12,17.77 5.82,21 7,14 2,9 8.91,8.26" stroke="currentColor" strokeWidth="2"/>
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

      {/* Datasets Disponíveis */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Datasets Disponíveis</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Dados estruturados em formatos abertos para análise e desenvolvimento.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Demografia e População",
              description: "Dados censitários, distribuição populacional e crescimento demográfico.",
              size: "2.4 MB",
              format: "CSV, JSON",
              updated: "Atualizado hoje",
              downloads: "1.2K",
              category: "social"
            },
            {
              title: "Economia e Finanças",
              description: "Indicadores econômicos, receitas municipais e investimentos públicos.",
              size: "1.8 MB", 
              format: "CSV, JSON",
              updated: "Há 2 dias",
              downloads: "890",
              category: "finance"
            },
            {
              title: "Mobilidade Urbana",
              description: "Dados de transporte, tráfego e infraestrutura viária da cidade.",
              size: "3.1 MB",
              format: "CSV, GeoJSON",
              updated: "Há 1 semana",
              downloads: "654",
              category: "transport"
            },
            {
              title: "Meio Ambiente",
              description: "Qualidade do ar, áreas verdes e indicadores ambientais urbanos.",
              size: "950 KB",
              format: "CSV, JSON",
              updated: "Há 3 dias",
              downloads: "432",
              category: "environment"
            },
            {
              title: "Saúde Pública",
              description: "Indicadores de saúde, equipamentos públicos e cobertura assistencial.",
              size: "1.5 MB",
              format: "CSV, JSON",
              updated: "Há 5 dias",
              downloads: "789",
              category: "health"
            },
            {
              title: "Educação",
              description: "Dados educacionais, escolas públicas e índices de desenvolvimento.",
              size: "1.2 MB",
              format: "CSV, JSON",
              updated: "Há 1 semana",
              downloads: "567",
              category: "education"
            }
          ].map((dataset, index) => {
            const categoryColors = {
              social: "var(--primary)",
              finance: "var(--accent)",
              transport: "var(--green)",
              environment: "var(--green)",
              health: "var(--orange)",
              education: "var(--accent)"
            };

            return (
              <div key={index} className="interactive-card bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)]">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className="inline-flex px-3 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${categoryColors[dataset.category]}15`, 
                        color: categoryColors[dataset.category] 
                      }}
                    >
                      {dataset.category}
                    </span>
                    <span className="text-xs text-[color:var(--muted)]">{dataset.downloads} downloads</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[var(--primary)] mb-2">
                    {dataset.title}
                  </h3>
                  
                  <p className="text-sm text-[color:var(--muted)] leading-relaxed mb-4">
                    {dataset.description}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
                    <span>{dataset.size}</span>
                    <span>{dataset.format}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[color:var(--muted)]">{dataset.updated}</span>
                    <button 
                      className="px-4 py-2 text-sm font-medium rounded-lg hover:scale-105 transition-transform"
                      style={{ 
                        backgroundColor: categoryColors[dataset.category], 
                        color: 'white' 
                      }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </StaggeredReveal>
      </section>

      {/* API e Desenvolvimento */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="fadeRight">
            <div>
              <div className="section-title">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">API de Dados</h2>
              </div>
              <div className="mt-8 space-y-6">
                <p className="text-lg text-[color:var(--muted)] leading-relaxed">
                  Acesso programático aos dados através de nossa <strong className="text-[var(--foreground)]">API RESTful</strong>, 
                  facilitando a integração e desenvolvimento de aplicações.
                </p>
                <p className="text-lg text-[color:var(--muted)] leading-relaxed">
                  Documentação completa, exemplos de código e SDKs disponíveis 
                  para desenvolvedores e pesquisadores.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {["REST API", "GraphQL", "WebSocket", "SDK Python", "SDK JavaScript"].map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeLeft">
            <div className="bg-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-[color:var(--muted)]">API Example</span>
              </div>
              
              <div className="font-mono text-sm">
                <div className="text-[var(--accent)] mb-2">GET /api/v1/demographics</div>
                <div className="text-[color:var(--muted)] pl-4 mb-2">
                  {`{`}<br/>
                  {"  "}
                  <span className="text-[var(--green)]">&quot;status&quot;</span>: 
                  <span className="text-[var(--orange)]">&quot;success&quot;</span>,<br/>
                  {"  "}
                  <span className="text-[var(--green)]">&quot;data&quot;</span>: {`{`}<br/>
                  {"    "}
                  <span className="text-[var(--green)]">&quot;population&quot;</span>: 
                  <span className="text-[var(--orange)]">450832</span>,<br/>
                  {"    "}
                  <span className="text-[var(--green)]">&quot;growth_rate&quot;</span>: 
                  <span className="text-[var(--orange)]">1.2</span><br/>
                  {"  "}{`}`}<br/>
                  {`}`}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <Link 
                  href="#" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium rounded-lg hover:scale-105 transition-transform"
                >
                  Ver Documentação
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="scale">
          <div className="text-center bg-gradient-to-br from-[var(--accent)]/10 via-[var(--card)] to-[var(--green)]/10 rounded-3xl p-12 border-2 border-[var(--accent)]/20">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
              Desenvolva soluções com nossos dados
            </h2>
            <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
              Use nossos dados abertos para criar aplicações, realizar pesquisas e desenvolver soluções inovadoras.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Acessar API
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/contato" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Solicitar Dados
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
