import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/hooks/useScrollAnimations";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/siteUrl";

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

function labelType(type) {
  const map = {
    MENOR_PRECO: "Menor preço",
    MELHOR_TECNICA: "Melhor técnica",
    TECNICA_PRECO: "Técnica e preço",
  };
  return map[String(type)] || String(type || "-");
}

function DocumentList() {
  const items = [
    { title: "Edital completo (PDF)", note: "Documento será disponibilizado conforme cronograma do processo." },
    { title: "Termo de Referência / Projeto Básico", note: "Documento será disponibilizado conforme cronograma do processo." },
    { title: "Anexos técnicos", note: "Documento será disponibilizado conforme cronograma do processo." },
    { title: "Minuta de contrato", note: "Documento será disponibilizado conforme cronograma do processo." },
    { title: "Modelos de declaração", note: "Documento será disponibilizado conforme cronograma do processo." },
    { title: "Esclarecimentos e impugnações", note: "Quando existirem, serão publicados nesta seção." },
  ];

  return (
    <div className="bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] overflow-hidden">
      {items.map((it, idx) => (
        <div key={it.title} className={`p-6 ${idx === 0 ? "" : "border-t border-[var(--border)]"}`}>
          <div className="flex items-start gap-3">
            <div className="text-lg" aria-hidden="true">📄</div>
            <div className="min-w-0">
              <div className="font-semibold text-[var(--primary)]">{it.title}</div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">{it.note}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const base = getSiteUrl();

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
        canonical: `${base}/licitacao/editais/${id}`,
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
                <div className="text-xs text-[color:var(--muted)]">Critério de Julgamento</div>
                <div className="font-medium text-[var(--foreground)]">{labelType(bidding.type)}</div>
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

            <div className="mb-4">
              <div className="text-xs text-[color:var(--muted)] mb-1">Base Legal</div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <ul className="text-sm text-[var(--foreground)] leading-relaxed list-disc pl-5 space-y-1">
                  <li>Lei nº 14.133/2021 – Lei de Licitações e Contratos Administrativos</li>
                  <li>
                    Regulamento de Licitações e Contratos do InPACTA (ver{" "}
                    <Link href="/licitacao/regulamento" className="text-[var(--accent)] hover:underline">regulamento</Link>)
                  </li>
                </ul>
                {bidding.legalBasis ? (
                  <div className="mt-3 text-sm text-[var(--foreground)] whitespace-pre-wrap">
                    <span className="text-[color:var(--muted)]">Complemento do processo:</span> {bidding.legalBasis}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-[color:var(--muted)] mb-1">Forma de Participação</div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)]">
                <div className="font-medium">{labelModality(bidding.modality)}</div>
                {String(bidding.modality) === "PREGAO_ELETRONICO" ? (
                  <div className="mt-1 text-[color:var(--muted)]">
                    Plataforma: conforme edital · Modo de disputa: conforme edital
                  </div>
                ) : (
                  <div className="mt-1 text-[color:var(--muted)]">Procedimentos e canal de participação: conforme edital.</div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-[color:var(--muted)] mb-1">Prazos Relevantes</div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <ul className="text-sm text-[var(--foreground)] leading-relaxed list-disc pl-5 space-y-1">
                  <li>Data de publicação: {formatDate(bidding.publicationDate)}</li>
                  <li>Data de abertura da sessão pública: {formatDate(bidding.openingDate)}</li>
                  <li>Data de encerramento: {formatDate(bidding.closingDate)}</li>
                  <li>Prazo para impugnação do edital: conforme edital e legislação aplicável</li>
                  <li>Prazo para pedidos de esclarecimento: conforme edital e legislação aplicável</li>
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-[color:var(--muted)] mb-1">Responsável pelo Processo</div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)]">
                Comissão de Licitação / Agente de Contratação<br />
                <span className="text-[color:var(--muted)]">InPACTA – Instituto de Projetos Avançados</span>
              </div>
            </div>

            {bidding.notes ? (
              <div>
                <div className="text-xs text-[color:var(--muted)] mb-1">Observações</div>
                <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{bidding.notes}</div>
              </div>
            ) : null}

            <div className="mt-4 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[color:var(--muted)]">
              Para documentos normativos (regulamentos, modelos e termos), consulte também a seção de{" "}
              <Link href="/licitacao/regulamento" className="text-[var(--accent)] hover:underline">Regulamento</Link>.
            </div>
          </div>
        </div>
      </section>

      {/* Documentos do processo */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-10">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">Documentos do Edital</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-3xl mx-auto">
              Publicações do processo e materiais de suporte. Caso algum documento ainda não esteja disponível, ele será publicado conforme o cronograma.
            </p>
          </div>
        </ScrollReveal>

        <DocumentList />
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
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                      <div className="flex-1 w-px bg-[var(--border)]" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--primary)]">{labelPhase(mv.phase)}</div>
                      <div className="mt-1 text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap break-words">
                        {mv.description}
                      </div>
                      <div className="mt-2 text-xs text-[color:var(--muted)]">
                        {formatDateTime(mv.date)}{mv?.createdBy?.name ? ` · ${mv.createdBy.name}` : ""}
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
                Pedidos de esclarecimento e demais comunicações deverão ser realizados exclusivamente pelo canal institucional, observados os prazos previstos no edital.
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

      {/* Nota de transparência */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="p-6 rounded-2xl border-2 border-[var(--border)] bg-[var(--background)] text-sm text-[color:var(--muted)] leading-relaxed">
          Este processo é conduzido em conformidade com os princípios da legalidade, impessoalidade, moralidade, publicidade, eficiência e transparência.
        </div>
      </section>
    </div>
  );
}
