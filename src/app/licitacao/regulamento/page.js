import { ScrollReveal } from "@/hooks/useScrollAnimations";

export const metadata = {
  title: "Regulamento de Licitações e Contratos — InPACTA",
  description: "Diretrizes, procedimentos e bases legais para licitações e contratos do InPACTA, assegurando transparência, integridade e conformidade.",
  alternates: {
    canonical: "https://inpacta.simplifique.click/licitacao/regulamento",
  },
};

export default function Page() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-15" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-16 bg-white rounded-full" />
                <span className="text-white/80 font-medium">Licitação</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {colorizeTitle("Regulamento de Licitações e Contratos")}
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-3xl">
                Diretrizes para contratações com integridade, eficiência e transparência, 
                em conformidade com a legislação aplicável.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Introdução */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-10">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">Introdução</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-3xl mx-auto">
              Este regulamento define princípios, responsabilidades e procedimentos para licitações e contratos, 
              assegurando legalidade, isonomia, seleção da proposta mais vantajosa e promoção do desenvolvimento sustentável.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">Base Legal</h3>
              <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                <li>• Lei nº 14.133/2021 — Nova Lei de Licitações e Contratos</li>
                <li>• Decreto Municipal/Estadual aplicável (quando pertinente)</li>
                <li>• Normas internas de compliance e integridade</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">Abrangência</h3>
              <p className="text-sm text-[color:var(--muted)]">
                Aplica-se às contratações de obras, serviços, compras e alienações realizadas pelo InPACTA e parceiros, 
                observando regimes e modalidades previstos em lei.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">Princípios</h3>
              <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                <li>• Planejamento, transparência e eficiência</li>
                <li>• Isonomia, publicidade e competitividade</li>
                <li>• Integridade, prevenção de fraudes e conflitos de interesse</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">Governança</h3>
              <p className="text-sm text-[color:var(--muted)]">
                Define papéis e responsabilidades, incluindo autoridade competente, comissão de contratação e fiscalização, 
                com fluxo de aprovação e monitoramento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Procedimentos */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-16">
          <ScrollReveal animation="fadeUp">
            <div className="text-center mb-10">
              <div className="section-title justify-center">
                <span className="bar" />
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">Procedimentos</h2>
              </div>
              <p className="mt-4 text-lg text-[color:var(--muted)] max-w-3xl mx-auto">
                Etapas essenciais para planejamento, seleção e execução contratual.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Planejamento da Contratação", desc: "Estudo técnico preliminar, termo de referência e estimativa de custos." },
              { title: "Divulgação e Publicidade", desc: "Editais, prazos, canais oficiais e mecanismos de impugnação." },
              { title: "Julgamento de Propostas", desc: "Critérios objetivos, habilitação e análise de conformidade." },
              { title: "Adjudicação e Homologação", desc: "Formalização da escolha e validação pela autoridade competente." },
              { title: "Execução e Fiscalização", desc: "Acompanhamento de metas, qualidade e conformidade contratual." },
              { title: "Gestão de Riscos", desc: "Matriz de riscos, garantias e sanções aplicáveis." },
            ].map((item, idx) => (
              <div key={idx} className="interactive-card bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)]">
                <h3 className="text-lg font-bold text-[var(--primary)] mb-2">{item.title}</h3>
                <p className="text-sm text-[color:var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Contratos */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-4">Contratos</h2>
            <p className="text-sm text-[color:var(--muted)] mb-4">
              Cláusulas essenciais, vigência, reajustes, garantias, penalidades e mecanismos de resolução de conflitos.
            </p>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>• Termos aditivos e repactuações</li>
              <li>• Medição e pagamento por resultados</li>
              <li>• Encerramento e prestação de contas</li>
            </ul>
          </div>
          <div className="glass rounded-2xl p-6 bg-gradient-to-br from-[var(--card)] to-[var(--background)] border-2 border-[var(--border)]">
            <h3 className="text-lg font-bold text-[var(--primary)] mb-3">Transparência e Compliance</h3>
            <p className="text-sm text-[color:var(--muted)] mb-3">
              Publicação de editais, resultados e contratos; canal de integridade e auditoria interna para prevenção a fraudes.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Editais", "Resultados", "Contratos", "Integridade"].map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 bg-[var(--background)] text-[var(--foreground)] rounded border border-[var(--border)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-6">Downloads</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Regulamento (PDF)", href: "#" },
              { name: "Modelos de Edital", href: "#" },
              { name: "Termo de Referência", href: "#" },
            ].map((d, i) => (
              <a key={i} href={d.href} className="interactive-card block p-6 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] hover:bg-[var(--background)] transition-colors">
                <div className="font-semibold text-[var(--primary)] mb-2">{d.name}</div>
                <div className="text-sm text-[color:var(--muted)]">Clique para baixar</div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function colorizeTitle(title) {
  if (!title || typeof title !== 'string') return title;
  const parts = title.split(' ');
  if (parts.length === 0) return title;
  const first = parts.shift();
  return (
    <>
      <span className="text-[var(--green)]">{first}</span>{' '}
      {parts.join(' ')}
    </>
  );
}
