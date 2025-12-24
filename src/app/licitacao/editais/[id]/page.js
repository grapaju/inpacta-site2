import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/hooks/useScrollAnimations";
import prisma from "@/lib/prisma";

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

function labelStatus(status) {
  const map = {
    PUBLICADO: "Publicado",
    EM_ANDAMENTO: "Em andamento",
    SUSPENSA: "Suspensa",
    HOMOLOGADO: "Homologado",
    ADJUDICADO: "Adjudicado",
    REVOGADO: "Revogado",
    ANULADO: "Anulado",
    DESERTO: "Deserto",
    FRACASSADO: "Fracassado",
    CONCLUIDA: "Concluída",
    PLANEJAMENTO: "Planejamento",
  };
  return map[String(status)] || String(status || "-");
}

function labelModality(modality) {
  const map = {
    PREGAO_ELETRONICO: "Pregão Eletrônico",
    PREGAO_PRESENCIAL: "Pregão Presencial",
    CONCORRENCIA: "Concorrência",
    TOMADA_PRECOS: "Tomada de Preços",
    CONVITE: "Convite",
    DISPENSA: "Dispensa",
    INEXIGIBILIDADE: "Inexigibilidade",
  };
  return map[String(modality)] || String(modality || "-");
}

function labelPhase(phase) {
  const map = {
    ABERTURA: "Abertura",
    QUESTIONAMENTOS: "Questionamentos",
    JULGAMENTO: "Julgamento",
    RECURSO: "Recurso",
    HOMOLOGACAO: "Homologação",
    CONTRATACAO: "Contratação",
    EXECUCAO: "Execução",
    ENCERRAMENTO: "Encerramento",
  };
  return map[String(phase)] || String(phase || "-");
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const bidding = await prisma.bidding.findUnique({
      where: { id },
      select: { number: true, title: true },
    });

    if (!bidding) {
      return {
        title: "Edital — Licitações — InPACTA",
      };
    }

    return {
      title: `${bidding.number} — ${bidding.title} — Editais — InPACTA`,
      description: "Detalhes da licitação e informações do processo.",
      alternates: {
        canonical: `https://inpacta.org.br/licitacao/editais/${id}`,
      },
    };
  } catch {
    return {
      title: "Edital — Licitações — InPACTA",
    };
  }
}

export default async function Page({ params }) {
  const { id } = await params;
  const now = new Date();

  const bidding = await prisma.bidding.findUnique({
    where: { id },
    include: {
      movements: {
        orderBy: { date: "desc" },
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!bidding) return notFound();

  // Somente licitações já publicadas (consistência com a listagem)
  if (bidding.status === "PLANEJAMENTO") return notFound();
  if (bidding.publicationDate && new Date(bidding.publicationDate) > now) return notFound();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-15" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-5xl">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-16 bg-white rounded-full" />
                    <span className="text-white/80 font-medium">Licitações</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold leading-tight break-words">
                    {bidding.number} — {bidding.title}
                  </h1>
                  <p className="mt-3 text-white/90 text-base md:text-lg max-w-4xl">
                    {bidding.object}
                  </p>
                </div>

                <Link
                  href="/licitacao/editais"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-white/30 font-semibold hover:bg-white/10 transition-colors ring-focus"
                >
                  ← Voltar para Editais
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-10">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">Dados do Processo</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-3xl mx-auto">
              Informações essenciais para acompanhamento do processo licitatório.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="interactive-card bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)]">
            <h3 className="text-lg font-bold text-[var(--primary)] mb-4">Identificação</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <div className="text-xs text-[color:var(--muted)]">Número</div>
                <div className="font-medium text-[var(--foreground)]">{bidding.number}</div>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <div className="text-xs text-[color:var(--muted)]">Status</div>
                <div className="font-medium text-[var(--foreground)]">{labelStatus(bidding.status)}</div>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <div className="text-xs text-[color:var(--muted)]">Modalidade</div>
                <div className="font-medium text-[var(--foreground)]">{labelModality(bidding.modality)}</div>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <div className="text-xs text-[color:var(--muted)]">Publicação</div>
                <div className="font-medium text-[var(--foreground)]">{formatDate(bidding.publicationDate)}</div>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <div className="text-xs text-[color:var(--muted)]">Abertura</div>
                <div className="font-medium text-[var(--foreground)]">{formatDate(bidding.openingDate)}</div>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <div className="text-xs text-[color:var(--muted)]">Encerramento</div>
                <div className="font-medium text-[var(--foreground)]">{formatDate(bidding.closingDate)}</div>
              </div>
            </div>
          </div>

          <div className="interactive-card bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)]">
            <h3 className="text-lg font-bold text-[var(--primary)] mb-4">Informações Complementares</h3>

            {bidding.legalBasis ? (
              <div className="mb-4">
                <div className="text-xs text-[color:var(--muted)] mb-1">Base legal</div>
                <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{bidding.legalBasis}</div>
              </div>
            ) : (
              <div className="mb-4 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[color:var(--muted)]">
                Base legal não informada.
              </div>
            )}

            {bidding.notes ? (
              <div>
                <div className="text-xs text-[color:var(--muted)] mb-1">Observações</div>
                <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{bidding.notes}</div>
              </div>
            ) : null}

            <div className="mt-4 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[color:var(--muted)]">
              Para documentos normativos (regulamentos, modelos e termos), consulte também a seção de Regulamento.
            </div>
          </div>
        </div>
      </section>

      {/* Histórico */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-16">
          <ScrollReveal animation="fadeUp">
            <div className="text-center mb-10">
              <div className="section-title justify-center">
                <span className="bar" />
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">Histórico de Movimentações</h2>
              </div>
              <p className="mt-4 text-lg text-[color:var(--muted)] max-w-3xl mx-auto">
                Registro cronológico das principais movimentações do processo.
              </p>
            </div>
          </ScrollReveal>

          {Array.isArray(bidding.movements) && bidding.movements.length > 0 ? (
            <div className="bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] overflow-hidden">
              {bidding.movements.map((mv, idx) => (
                <div key={mv.id} className={`p-6 ${idx === 0 ? "" : "border-t border-[var(--border)]"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--primary)]">
                        {labelPhase(mv.phase)}
                      </div>
                      <div className="mt-1 text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap break-words">
                        {mv.description}
                      </div>
                      <div className="mt-2 text-xs text-[color:var(--muted)]">
                        {formatDateTime(mv.date)}
                        {mv?.createdBy?.name ? ` · ${mv.createdBy.name}` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="interactive-card bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)]">
              <p className="text-sm text-[color:var(--muted)]">Não há movimentações registradas para esta licitação.</p>
            </div>
          )}
        </section>
      </div>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="glass rounded-2xl p-8 bg-gradient-to-br from-[var(--card)] to-[var(--background)] border-2 border-[var(--border)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-[var(--primary)] mb-2">Dúvidas ou solicitações</h3>
              <p className="text-sm text-[color:var(--muted)]">
                Para solicitar informações adicionais, utilize o canal institucional de contato.
              </p>
            </div>
            <Link
              href="/contato?assunto=lai#formulario"
              className="btn-primary inline-flex items-center gap-2"
            >
              Solicitar Informação
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
