import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/hooks/useScrollAnimations";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/siteUrl";
import { Prisma } from "@prisma/client";
import { formatDocumentoPublicTitle } from "@/lib/biddingDocumentRules";
import OpenDetailsOnHash from "@/components/OpenDetailsOnHash";
import { IconChevronDown, IconEye, IconFileText } from "@/components/Icons";

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

function truncateText(text, maxLength) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function extractFirstSentence(text, maxLength = 180) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) return "";

  const punctuationIndex = value.search(/[.!?](\s|$)/);
  const sentence = punctuationIndex >= 0 ? value.slice(0, punctuationIndex + 1) : value;
  return truncateText(sentence, maxLength);
}

function normalizeObjectText(text) {
  return String(text || "").replace(/\r\n/g, "\n").trim();
}

function parseObjectAsList(text) {
  const value = normalizeObjectText(text);
  if (!value) return null;

  const lines = value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const bulletPrefixRegex = /^([-•*]\s+|\d+[\.)]\s+)/;
  const bulletLines = lines.filter((l) => bulletPrefixRegex.test(l));
  if (lines.length >= 2 && bulletLines.length >= 2 && bulletLines.length / lines.length >= 0.5) {
    const items = lines
      .map((l) => l.replace(bulletPrefixRegex, "").trim())
      .filter(Boolean);
    return items.length >= 2 ? items : null;
  }

  const parts = value
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 3 && parts.every((p) => p.length <= 220)) {
    return parts;
  }

  // Ex: "Item A - Item B - Item C" (3+ itens). Evita conflitar com hífens comuns.
  if (!value.includes("\n") && value.includes(" - ")) {
    const dashParts = value
      .split(/\s-\s/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (dashParts.length >= 3 && dashParts.every((p) => p.length <= 220)) {
      return dashParts;
    }
  }

  return null;
}

async function getBiddingDocumentsCompat(biddingId) {
  try {
    const cols = await prisma.$queryRaw(
      Prisma.sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'bidding_documents'
      `
    );
    const columnSet = new Set((cols || []).map((c) => c.column_name));

    const safe = (name) => {
      if (!columnSet.has(name)) return null;
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) return null;
      return name;
    };

    const bidCol = safe("biddingId") || safe("bidding_id");
    if (!bidCol) return [];

    const coalesce = (a, b) => {
      if (a && b && a !== b) return Prisma.raw(`COALESCE(\"${a}\", \"${b}\")`);
      if (a) return Prisma.raw(`\"${a}\"`);
      if (b) return Prisma.raw(`\"${b}\"`);
      return Prisma.raw("NULL");
    };

    const fileNameExpr = coalesce(safe("fileName"), safe("file_name") || safe("filename"));
    const filePathExpr = coalesce(
      safe("filePath"),
      safe("file_path") || safe("filepath") || safe("path")
    );
    const fileSizeExpr = coalesce(safe("fileSize"), safe("file_size"));
    const fileTypeExpr = coalesce(safe("fileType"), safe("file_type") || safe("mimetype"));
    const createdAtExpr = coalesce(safe("createdAt"), safe("created_at"));
    const tipoDocumentoExpr = coalesce(safe("tipoDocumento"), safe("tipo_documento") || safe("document_type"));
    const numeroAnexoExpr = coalesce(safe("numeroAnexo"), safe("numero_anexo") || safe("annex_number"));
    const tituloExibicaoExpr = coalesce(safe("tituloExibicao"), safe("titulo_exibicao") || safe("display_title"));

    const bidColIdent = Prisma.raw(`\"${bidCol}\"`);

    const hasStatus = Boolean(safe("status"));

    const documents = await prisma.$queryRaw(
      Prisma.sql`
        SELECT
          "id",
          "phase",
          "title",
          "description",
          "order",
          ${hasStatus ? Prisma.raw('"status"') : Prisma.raw('NULL')} AS "status",
          ${tipoDocumentoExpr} AS "tipoDocumento",
          ${numeroAnexoExpr} AS "numeroAnexo",
          ${tituloExibicaoExpr} AS "tituloExibicao",
          ${fileNameExpr} AS "fileName",
          ${filePathExpr} AS "filePath",
          ${fileSizeExpr} AS "fileSize",
          ${fileTypeExpr} AS "fileType",
          ${createdAtExpr} AS "createdAt"
        FROM "bidding_documents"
        WHERE ${bidColIdent} = ${biddingId}
        ${hasStatus ? Prisma.sql`AND "status" = 'PUBLISHED'` : Prisma.empty}
        ORDER BY "phase" ASC, "order" ASC, "createdAt" DESC
      `
    );

    return Array.isArray(documents) ? documents : [];
  } catch {
    return [];
  }
}

function DocumentList({ documents }) {
  if (!Array.isArray(documents) || documents.length === 0) {
    return (
      <div className="interactive-card bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)]">
        <p className="text-sm text-[color:var(--muted)]">
          Nenhum documento publicado para download até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] overflow-hidden">
      {documents.map((doc, idx) => (
        <div key={doc.id || `${doc.title}-${idx}`} className={`p-6 ${idx === 0 ? "" : "border-t border-[var(--border)]"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="text-[var(--primary)] mt-0.5" aria-hidden="true">
                <IconFileText width="20" height="20" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[var(--primary)] break-words">
                  {formatDocumentoPublicTitle({
                    tipoDocumento: doc.tipoDocumento,
                    numeroAnexo: doc.numeroAnexo,
                    tituloExibicao: doc.tituloExibicao,
                    title: doc.title
                  })}
                </div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {doc.phase ? `${labelPhase(doc.phase)} · ` : ""}
                  {doc.fileName || "Arquivo"}
                </div>
              </div>
            </div>

            {doc.filePath ? (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <a
                  href={`/api/public/biddings/documents/${doc.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <span className="inline-flex items-center gap-2">
                    <IconEye width="18" height="18" aria-hidden="true" />
                    Visualizar
                  </span>
                </a>
                <a
                  href={`/api/public/biddings/documents/${doc.id}/download`}
                  className="btn-secondary"
                >
                  Baixar
                </a>
              </div>
            ) : (
              <span className="text-sm text-[color:var(--muted)] whitespace-nowrap">Indisponível</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function normalizeTipoDocumentoForUi(doc) {
  const raw = doc?.tipoDocumento;
  const normalized = String(raw || "").trim().toUpperCase();
  if (normalized) return normalized;
  // Fallback: se veio sem tipo mas tem numeroAnexo, trata como ANEXO.
  if (doc?.numeroAnexo !== null && doc?.numeroAnexo !== undefined) return "ANEXO";
  return "";
}

function sortDocumentsForUi(a, b) {
  const aOrder = Number.isFinite(Number(a?.order)) ? Number(a.order) : 0;
  const bOrder = Number.isFinite(Number(b?.order)) ? Number(b.order) : 0;
  if (aOrder !== bOrder) return aOrder - bOrder;

  const aAnexo = a?.numeroAnexo !== null && a?.numeroAnexo !== undefined ? Number(a.numeroAnexo) : null;
  const bAnexo = b?.numeroAnexo !== null && b?.numeroAnexo !== undefined ? Number(b.numeroAnexo) : null;
  if (aAnexo !== null && bAnexo !== null && aAnexo !== bAnexo) return aAnexo - bAnexo;

  const aCreated = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bCreated = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
  return bCreated - aCreated;
}

function DocumentGroups({ documents }) {
  const list = Array.isArray(documents) ? documents.slice() : [];
  if (list.length === 0) return <DocumentList documents={list} />;

  const anexos = [];
  const editalEOutros = [];

  for (const doc of list) {
    const tipo = normalizeTipoDocumentoForUi(doc);
    if (tipo === "ANEXO") anexos.push(doc);
    else editalEOutros.push(doc);
  }

  anexos.sort(sortDocumentsForUi);
  editalEOutros.sort(sortDocumentsForUi);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[var(--text)] mb-3">Edital</h3>
        <DocumentList documents={editalEOutros} />
      </div>

      {anexos.length > 0 && (
        <details className="bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] overflow-hidden">
          <summary className="cursor-pointer select-none p-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-semibold text-[var(--text)]">Anexos ({anexos.length})</div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">Clique para expandir e visualizar a lista</div>
            </div>
            <span className="text-[var(--muted)]" aria-hidden="true">
              <IconChevronDown width="20" height="20" />
            </span>
          </summary>
          <div className="px-6 pb-6">
            <DocumentList documents={anexos} />
          </div>
        </details>
      )}
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

  const documents = await getBiddingDocumentsCompat(id);
  const objectFull = String(bidding.object || "").trim();
  const summaryEditorial = String(bidding.description || "").trim();
  const summaryFallback = extractFirstSentence(objectFull, 180);
  const summaryText = summaryEditorial || summaryFallback;
  const objectListItems = parseObjectAsList(objectFull);
  const showObjectLink = Boolean(objectFull && (summaryEditorial || (summaryFallback && objectFull.length > summaryFallback.length)));

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
                  {summaryText ? (
                    <div className="mt-3 max-w-4xl">
                      <p className="text-white/90 text-sm md:text-base leading-relaxed">
                        {summaryText}
                      </p>
                      {showObjectLink ? (
                        <a
                          href="#objeto"
                          className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg border border-white/30 text-sm font-semibold hover:bg-white/10 transition-colors ring-focus"
                        >
                          Ver objeto completo
                        </a>
                      ) : null}
                    </div>
                  ) : null}
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

        {objectFull ? (
          <div id="objeto" className="interactive-card bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)] mb-8">
            <OpenDetailsOnHash anchorId="objeto" detailsId="objeto-details" />
            <details id="objeto-details" className="group">
              <summary className="cursor-pointer select-none flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-[var(--primary)]">Objeto da Licitação</h3>
                <span className="text-sm text-[color:var(--muted)] group-open:hidden whitespace-nowrap">Expandir</span>
                <span className="text-sm text-[color:var(--muted)] hidden group-open:inline whitespace-nowrap">Recolher</span>
              </summary>

              <div className="mt-3">
                {objectListItems ? (
                  <ul className="text-sm md:text-base text-[var(--foreground)] leading-relaxed list-disc pl-5 space-y-1">
                    {objectListItems.map((item, idx) => (
                      <li key={`${idx}-${item.slice(0, 16)}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm md:text-base text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                    {objectFull}
                  </p>
                )}
              </div>
            </details>
          </div>
        ) : null}

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

        <DocumentGroups documents={documents} />
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
