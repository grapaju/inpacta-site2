import { ScrollReveal } from "@/hooks/useScrollAnimations";
import prisma from "@/lib/prisma";
import { formatDateOnlyPtBR } from "@/lib/dateOnly";
import { getSiteUrl } from "@/lib/siteUrl";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const SITE_URL = getSiteUrl();

export const metadata = {
  title: "Regulamento de Licitações e Contratos — InPACTA",
  description: "Diretrizes, procedimentos e bases legais para licitações e contratos do InPACTA, assegurando transparência, integridade e conformidade.",
  alternates: {
    canonical: `${SITE_URL}/licitacao/regulamento`,
  },
};

export default async function Page() {
  noStore();
  const documentos = await prisma.documento.findMany({
    where: {
      status: "PUBLISHED",
      apareceEm: { has: "LICITACOES" },
    },
    include: {
      versaoVigente: true,
    },
    orderBy: [{ ordemExibicao: "asc" }, { updatedAt: "desc" }],
  });

  const groups = documentos.reduce(
    (acc, doc) => {
      const sub = String((doc?.subcategoriaLicitacoes ?? doc?.subcategoria) || "").toLowerCase();
      const title = String(doc?.titulo || "").toLowerCase();
      const slug = String(doc?.slug || "").toLowerCase();

      const isRegulamento =
        sub.includes("regulamento") ||
        title.includes("regulamento") ||
        slug.includes("regulamento");
      const isModeloEdital =
        sub.includes("modelo") ||
        title.includes("modelo") ||
        sub.includes("edital") ||
        title.includes("edital");
      const isTermoReferencia =
        sub.includes("termo") ||
        title.includes("termo") ||
        sub.includes("referência") ||
        sub.includes("referencia") ||
        title.includes("referência") ||
        title.includes("referencia");

      if (isModeloEdital) {
        acc.modelos.push(doc);
      } else if (isTermoReferencia) {
        acc.termos.push(doc);
      } else if (isRegulamento) {
        acc.regulamentos.push(doc);
      } else {
        // fallback para não “sumir” documentos novos
        acc.regulamentos.push(doc);
      }

      return acc;
    },
    { regulamentos: [], modelos: [], termos: [] }
  );

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
                <span className="text-white/80 font-medium">Licitações e Contratações</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {colorizeTitle("Regulamento de Licitações e Contratos")}
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-3xl">
                Regulamento que estabelece normas e procedimentos para os processos de licitação e contratação do InPACTA,
                observando os princípios da legalidade, integridade, eficiência e transparência.
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
              Este regulamento estabelece princípios, responsabilidades e procedimentos aplicáveis às licitações e contratos do InPACTA,
              assegurando a legalidade, a isonomia entre os participantes, a seleção da proposta mais vantajosa e a promoção do desenvolvimento sustentável.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">Base Legal</h3>
              <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                <li>• Lei nº 14.133/2021 — Nova Lei de Licitações e Contratos</li>
                <li>• Normas e atos administrativos aplicáveis, quando pertinentes</li>
                <li>• Normas internas de compliance, integridade e governança</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">Abrangência</h3>
              <p className="text-sm text-[color:var(--muted)]">
                Aplica-se às contratações de obras, serviços, compras e alienações realizadas pelo InPACTA, observados os regimes,
                modalidades e procedimentos previstos na legislação aplicável.
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
                O regulamento define os papéis e responsabilidades dos agentes envolvidos nos processos de contratação, incluindo a autoridade
                competente, a comissão de contratação e a fiscalização, bem como os fluxos de aprovação, acompanhamento e monitoramento.
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
                Os procedimentos para licitações e contratações abrangem etapas essenciais de planejamento, seleção e execução contratual,
                observando a legislação vigente e as diretrizes institucionais.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Planejamento da Contratação",
                desc: "Compreende a elaboração de estudo técnico preliminar, termo de referência e estimativa de custos, de forma a subsidiar a tomada de decisão e a adequada definição do objeto.",
              },
              {
                title: "Divulgação e Publicidade",
                desc: "Envolve a publicação de editais, definição de prazos, utilização de canais oficiais de comunicação e a disponibilização de mecanismos para esclarecimentos e impugnações.",
              },
              {
                title: "Julgamento de Propostas",
                desc: "Realizado com base em critérios objetivos, análise de habilitação dos proponentes e verificação da conformidade das propostas com os requisitos estabelecidos.",
              },
              {
                title: "Adjudicação e Homologação",
                desc: "Consiste na formalização da escolha da proposta vencedora e na homologação do resultado pela autoridade competente.",
              },
              {
                title: "Execução e Fiscalização",
                desc: "Abrange o acompanhamento da execução contratual, com foco no cumprimento de metas, na qualidade dos serviços ou bens contratados e na conformidade com as obrigações assumidas.",
              },
              {
                title: "Gestão de Riscos",
                desc: "Prevê a identificação e o tratamento de riscos por meio de matriz de riscos, definição de garantias e aplicação de sanções, quando cabível.",
              },
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
              Os contratos celebrados pelo InPACTA observam cláusulas essenciais relativas à vigência, reajustes, garantias, penalidades e
              mecanismos de resolução de conflitos, em conformidade com a legislação aplicável e as diretrizes institucionais.
            </p>
            <p className="text-sm text-[color:var(--muted)] mb-3">Incluem-se, entre outros aspectos:</p>
            <ul className="space-y-2 text-sm text-[color:var(--muted)]">
              <li>• Termos aditivos e repactuações</li>
              <li>• Medição e pagamento vinculados a resultados</li>
              <li>• Encerramento contratual e prestação de contas</li>
            </ul>
          </div>
          <div className="glass rounded-2xl p-6 bg-gradient-to-br from-[var(--card)] to-[var(--background)] border-2 border-[var(--border)]">
            <h3 className="text-lg font-bold text-[var(--primary)] mb-3">Transparência e Compliance</h3>
            <p className="text-sm text-[color:var(--muted)] mb-3">
              Os processos de licitação e contratação asseguram a ampla publicidade dos editais, resultados e contratos firmados, bem como a adoção
              de práticas de integridade, com canal específico para apuração de irregularidades e atuação de auditoria interna voltada à prevenção de fraudes.
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

          <div className="space-y-10">
            {/* Regulamento */}
            <div>
              <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Regulamento</h3>
              {groups.regulamentos.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[var(--card)] border-2 border-[var(--border)]">
                  <p className="text-sm text-[color:var(--muted)]">Não há documentos publicados nesta seção no momento.</p>
                </div>
              ) : (
                <div className="bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] overflow-hidden">
                  {groups.regulamentos.map((doc, idx) => {
                    const vigente = doc.versaoVigente;
                    const metaParts = [];
                    if (vigente?.dataAprovacao) {
                      metaParts.push(`Aprovado em ${formatDateOnlyPtBR(vigente.dataAprovacao)}`);
                    }
                    if (typeof vigente?.versao === "number") {
                      metaParts.push(`Versão ${vigente.versao}`);
                    }

                    return (
                      <div key={doc.id} className={`p-6 ${idx === 0 ? "" : "border-t border-[var(--border)]"}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-semibold text-[var(--primary)] mb-2 whitespace-normal break-words">
                              {doc.titulo}
                            </div>
                            {metaParts.length > 0 && (
                              <div className="text-sm text-[color:var(--muted)]">{metaParts.join(" · ")}</div>
                            )}
                          </div>

                          {vigente?.arquivoPdf ? (
                            <a
                              href={vigente.arquivoPdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[var(--border)] font-semibold hover:bg-[var(--background)] transition-colors ring-focus shrink-0"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Download PDF
                            </a>
                          ) : (
                            <span className="text-sm font-semibold text-[color:var(--muted)] shrink-0">Em breve</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
