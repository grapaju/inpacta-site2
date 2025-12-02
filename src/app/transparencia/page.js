import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export const metadata = {
  title: "Transparência — InPACTA",
  description: "Acesso à informação pública, relatórios, prestação de contas e dados transparentes do InPACTA. Compromisso com a Lei de Acesso à Informação.",
};

export default function Page() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--green)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-16 bg-white rounded-full"></div>
                <span className="text-white/80 font-medium">Lei de Acesso à Informação</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-[var(--green)]">Transparência</span> em primeiro lugar
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                Garantimos o direito fundamental de acesso às informações públicas, 
                promovendo gestão aberta, responsável e participativa.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Relatórios e Documentos */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Relatórios e Documentos</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Acesse nossos relatórios financeiros, de gestão e documentos oficiais.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Relatórios Financeiros",
              description: "Balanços, demonstrativos de receitas e despesas, execução orçamentária e auditoria.",
              icon: "chart",
              color: "var(--accent)",
              documents: ["Balanço 2024", "Relatório de Execução", "Auditoria Externa"]
            },
            {
              title: "Relatórios de Gestão",
              description: "Relatórios de atividades, resultados alcançados e impacto dos projetos desenvolvidos.",
              icon: "clipboard",
              color: "var(--green)",
              documents: ["Relatório Anual", "Indicadores de Performance", "Projetos Concluídos"]
            },
            {
              title: "Documentos Oficiais",
              description: "Atos normativos, regimentos, estatutos e documentos de constituição do instituto.",
              icon: "file",
              color: "var(--orange)",
              documents: ["Estatuto Social", "Regimento Interno", "Atos Constitutivos"]
            }
          ].map((category, index) => (
            <div key={index} className="interactive-card bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)]">
              <div className="mb-6">
                <div 
                  className="inline-flex size-16 items-center justify-center rounded-2xl mb-4"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  {category.icon === "chart" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 17l-5-5-4 4-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {category.icon === "clipboard" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                  {category.icon === "file" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-[var(--primary)] mb-3">
                {category.title}
              </h3>
              
              <p className="text-[color:var(--muted)] leading-relaxed mb-6">
                {category.description}
              </p>
              
              <div className="space-y-2">
                {category.documents.map((doc, docIndex) => (
                  <div key={docIndex} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <span className="text-sm font-medium text-[var(--foreground)]">{doc}</span>
                    <button 
                      className="text-sm font-medium hover:underline transition-colors"
                      style={{ color: category.color }}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </StaggeredReveal>
      </section>

      {/* CTA */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="scale">
            <div className="text-center bg-gradient-to-br from-[var(--green)]/10 via-[var(--card)] to-[var(--accent)]/10 rounded-3xl p-12 border-2 border-[var(--green)]/20">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
                Dúvidas sobre acesso à informação?
              </h2>
              <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
                Nossa equipe está pronta para ajudar você a encontrar as informações que precisa.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contato" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--green)] text-white font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Fale Conosco
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/dados" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Explorar Dados
              </Link>
            </div>
          </div>
        </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
